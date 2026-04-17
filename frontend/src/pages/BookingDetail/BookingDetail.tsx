import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bookingsApi, paymentsApi } from '../../api/services'
import { useToast } from '../../context/ToastContext'
import type { Booking } from '../../types'
import './BookingDetail.css'

const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD', label: '💳 Credit Card' },
  { value: 'DEBIT_CARD',  label: '💳 Debit Card' },
  { value: 'UPI',         label: '📱 UPI' },
  { value: 'NET_BANKING', label: '🏦 Net Banking' },
  { value: 'WALLET',      label: '👜 Wallet' },
]

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [payMethod, setPayMethod] = useState('UPI')
  const [paying, setPaying] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const fetchBooking = () => {
    if (!id) return
    bookingsApi.getById(id).then(r => setBooking(r.data.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchBooking() }, [id])

  const handlePay = async () => {
    if (!id) return
    setPaying(true)
    try {
      const res = await paymentsApi.pay(id, { paymentMethod: payMethod })
      const status = res.data.data.status
      if (status === 'SUCCESS') {
        showToast('Payment successful! Enjoy the show 🎬', 'success')
      } else {
        showToast('Payment failed. Please try again.', 'error')
      }
      fetchBooking()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Payment error', 'error')
    } finally {
      setPaying(false)
    }
  }

  const handleCancel = async () => {
    if (!id || !window.confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(true)
    try {
      await bookingsApi.cancel(id)
      showToast('Booking cancelled', 'success')
      fetchBooking()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Cancel failed', 'error')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />
  if (!booking) return <div className="container" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Booking not found</div>

  const showDate = new Date(booking.show.showTime)
  const statusColor: Record<string, string> = {
    CREATED: '#9d9ba5', PENDING_PAYMENT: '#f0a040',
    CONFIRMED: '#52b788', CANCELLED: '#e63946'
  }

  return (
    <div className="booking-detail-page">
      <div className="container">
        <div className="booking-detail-grid fade-up">
          {/* Left — Ticket */}
          <div className="ticket-card">
            <div className="ticket-header">
              <div className="ticket-status" style={{ color: statusColor[booking.status] }}>
                ● {booking.status.replace('_', ' ')}
              </div>
              <div className="ticket-id">#{booking.id.slice(0, 8).toUpperCase()}</div>
            </div>

            <div className="ticket-movie">{booking.show.movie.title}</div>

            <div className="ticket-meta-grid">
              <div className="ticket-meta-item">
                <span className="ticket-meta-label">Date</span>
                <span>{showDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
              <div className="ticket-meta-item">
                <span className="ticket-meta-label">Time</span>
                <span>{showDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
              </div>
              <div className="ticket-meta-item">
                <span className="ticket-meta-label">Venue</span>
                <span>{booking.show.screen?.multiplex?.name || '—'}</span>
              </div>
              <div className="ticket-meta-item">
                <span className="ticket-meta-label">Screen</span>
                <span>Screen {booking.show.screen?.screenNumber}</span>
              </div>
            </div>

            <div className="ticket-divider">
              <div className="ticket-cutout left" />
              <div className="ticket-dashes" />
              <div className="ticket-cutout right" />
            </div>

            <div className="ticket-seats">
              <span className="ticket-meta-label">Seats</span>
              <div className="seat-chips">
                {booking.bookingSeats.map(bs => {
                  const seat = bs.showSeat?.seat
                  return (
                    <span key={bs.id} className="seat-chip">
                      {seat ? `${seat.rowLabel}${seat.seatNumber}` : '—'}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className="ticket-footer">
              <div>
                <span className="ticket-meta-label">Total Amount</span>
                <div className="ticket-amount">₹{booking.totalAmount.toFixed(2)}</div>
              </div>
              {booking.payment?.status === 'SUCCESS' && (
                <div className="payment-status-badge">✓ PAID</div>
              )}
            </div>
          </div>

          {/* Right — Actions */}
          <div className="booking-actions-panel">
            {booking.status === 'CREATED' && (
              <div className="payment-section">
                <h3 className="panel-title">Complete Payment</h3>
                <p className="panel-sub">Select your preferred payment method</p>

                <div className="payment-methods">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m.value}
                      className={`payment-method-btn ${payMethod === m.value ? 'selected' : ''}`}
                      onClick={() => setPayMethod(m.value)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <button className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: 20 }}
                  onClick={handlePay} disabled={paying}>
                  {paying ? 'Processing...' : `Pay ₹${booking.totalAmount.toFixed(2)}`}
                </button>

                <button className="btn btn-ghost cancel-btn" onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
            )}

            {booking.status === 'CONFIRMED' && (
              <div className="status-panel status-confirmed">
                <div className="status-icon">✓</div>
                <h3>Booking Confirmed!</h3>
                <p>Your seats are reserved. Enjoy the movie! 🍿</p>
                {booking.payment && (
                  <div className="payment-receipt">
                    <div className="receipt-row">
                      <span>Transaction ID</span>
                      <span className="receipt-val">{booking.payment.transactionId}</span>
                    </div>
                    <div className="receipt-row">
                      <span>Method</span>
                      <span className="receipt-val">{booking.payment.paymentMethod.replace('_', ' ')}</span>
                    </div>
                    <div className="receipt-row">
                      <span>Paid At</span>
                      <span className="receipt-val">{booking.payment.paidAt ? new Date(booking.payment.paidAt).toLocaleString('en-IN') : '—'}</span>
                    </div>
                  </div>
                )}
                <button className="btn btn-ghost" style={{ marginTop: 16, width: '100%' }}
                  onClick={() => navigate('/bookings')}>
                  My Bookings
                </button>
              </div>
            )}

            {booking.status === 'CANCELLED' && (
              <div className="status-panel status-cancelled">
                <div className="status-icon cancelled">✕</div>
                <h3>Booking Cancelled</h3>
                <p>This booking has been cancelled and seats have been released.</p>
                <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }}
                  onClick={() => navigate('/shows')}>
                  Browse Shows
                </button>
              </div>
            )}

            {booking.status === 'PENDING_PAYMENT' && (
              <div className="status-panel">
                <div className="status-icon" style={{ background: 'rgba(240,160,64,0.15)', color: '#f0a040' }}>⏳</div>
                <h3>Processing Payment</h3>
                <p>Your payment is being processed. Please wait.</p>
                <button className="btn btn-ghost" style={{ marginTop: 16, width: '100%' }}
                  onClick={fetchBooking}>
                  Refresh Status
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetail
