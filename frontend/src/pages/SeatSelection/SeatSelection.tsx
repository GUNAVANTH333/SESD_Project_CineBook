import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { showsApi, bookingsApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { MapPin, Monitor, CalendarDays, Clock, Armchair } from 'lucide-react'
import type { Show, SeatMapEntry } from '../../types'
import './SeatSelection.css'

const SeatSelection: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [show, setShow] = useState<Show | null>(null)
  const [seatMap, setSeatMap] = useState<SeatMapEntry[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([showsApi.getById(id), showsApi.getSeatMap(id)])
      .then(([sRes, smRes]) => {
        setShow(sRes.data.data)
        setSeatMap(smRes.data.data)
      })
      .catch(() => showToast('Failed to load seat map', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  const toggleSeat = (showSeatId: string, status: string) => {
    if (status !== 'AVAILABLE') return
    setSelected(prev =>
      prev.includes(showSeatId) ? prev.filter(s => s !== showSeatId) : [...prev, showSeatId]
    )
  }

  const totalAmount = selected.reduce((sum, ssId) => {
    const seat = seatMap.find(s => s.showSeatId === ssId)
    return sum + (seat?.price || 0)
  }, 0)

  const handleBook = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (selected.length === 0) { showToast('Please select at least one seat', 'error'); return }
    setBooking(true)
    try {
      const res = await bookingsApi.create({ showId: id!, showSeatIds: selected })
      showToast('Seats booked! Proceed to payment.', 'success')
      navigate(`/booking/${res.data.data.id}`)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Booking failed', 'error')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />

  if (!show) return (
    <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Show not found.</p>
    </div>
  )

  const rows = seatMap.reduce<Record<string, SeatMapEntry[]>>((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = []
    acc[seat.row].push(seat)
    return acc
  }, {})

  const showDate = new Date(show.showTime)

  return (
    <div className="seat-page">
      <div className="container">
        <div className="show-info-bar fade-up">
          <Link to="/shows" className="back-link">← Back</Link>
          <div className="show-info-main">
            <h1 className="show-movie-title">{show.movie.title}</h1>
            <div className="show-info-meta">
              <span><MapPin size={13} /> {show.screen?.multiplex?.name}</span>
              <span><Monitor size={13} /> Screen {show.screen?.screenNumber}</span>
              <span><CalendarDays size={13} /> {showDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              <span><Clock size={13} /> {showDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
            </div>
          </div>
        </div>

        <div className="screen-label fade-up">
          <div className="screen-bar" />
          <span>SCREEN</span>
        </div>

        {seatMap.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <Armchair size={40} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--text-muted)' }} />
            <p>No seats available for this show</p>
          </div>
        ) : (
          <div className="seat-map fade-up">
            {Object.entries(rows).sort(([a], [b]) => a.localeCompare(b)).map(([row, seats]) => (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
                <div className="seats">
                  {seats.sort((a, b) => a.number - b.number).map(seat => (
                    <button
                      key={seat.showSeatId}
                      title={`${seat.label} • ${seat.type} • ₹${seat.price}`}
                      className={`seat seat-${seat.type.toLowerCase()} seat-${seat.status.toLowerCase()} ${selected.includes(seat.showSeatId) ? 'seat-selected' : ''}`}
                      onClick={() => toggleSeat(seat.showSeatId, seat.status)}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
                <span className="row-label">{row}</span>
              </div>
            ))}
          </div>
        )}

        <div className="seat-legend fade-up">
          <div className="legend-item"><div className="legend-box seat-standard" />Standard</div>
          <div className="legend-item"><div className="legend-box seat-premium" />Premium</div>
          <div className="legend-item"><div className="legend-box seat-recliner" />Recliner</div>
          <div className="legend-item"><div className="legend-box seat-booked" />Booked</div>
          <div className="legend-item"><div className="legend-box seat-selected" />Selected</div>
        </div>

        <div className="price-info fade-up">
          <div className="price-tag">Standard: ₹{show.basePrice}</div>
          <div className="price-tag">Premium: ₹{(show.basePrice * 1.5).toFixed(0)}</div>
          <div className="price-tag">Recliner: ₹{(show.basePrice * 2).toFixed(0)}</div>
        </div>

        {selected.length > 0 && (
          <div className="booking-summary fade-up">
            <div className="summary-seats">
              <span className="summary-label">Selected ({selected.length})</span>
              <div className="selected-tags">
                {selected.map(ssId => {
                  const s = seatMap.find(x => x.showSeatId === ssId)
                  return s ? <span key={ssId} className="seat-tag">{s.label}</span> : null
                })}
              </div>
            </div>
            <div className="summary-total">
              <span className="total-label">Total</span>
              <span className="total-amount">₹{totalAmount.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary" onClick={handleBook} disabled={booking} style={{ minWidth: 160 }}>
              {booking ? 'Booking...' : 'Confirm Seats'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SeatSelection
