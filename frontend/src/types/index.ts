export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'CUSTOMER'
  phone?: string
  createdAt: string
}

export interface Movie {
  id: string
  title: string
  genre: string
  durationMinutes: number
  language: string
  rating: string
  posterUrl: string
  releaseDate: string
}

export interface Multiplex {
  id: string
  name: string
  location: string
  city: string
  totalScreens: number
  screens: Screen[]
}

export interface Screen {
  id: string
  multiplexId: string
  screenNumber: number
  totalRows: number
  totalColumns: number
  capacity: number
}

export interface Show {
  id: string
  movieId: string
  screenId: string
  showTime: string
  endTime: string
  basePrice: number
  status: string
  movie: Movie
  screen: Screen & { multiplex: Multiplex }
}

export interface SeatMapEntry {
  showSeatId: string
  seatId: string
  label: string
  row: string
  number: number
  type: 'STANDARD' | 'PREMIUM' | 'RECLINER'
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED'
  price: number
}

export interface BookingSeat {
  id: string
  showSeatId: string
  price: number
  showSeat?: { seat: { rowLabel: string; seatNumber: number; seatType: string } }
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  status: 'INITIATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
  transactionId: string
  paymentMethod: string
  paidAt?: string
}

export interface Booking {
  id: string
  userId: string
  showId: string
  totalAmount: number
  seatCount: number
  status: 'CREATED' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED'
  createdAt: string
  expiresAt?: string
  bookingSeats: BookingSeat[]
  payment?: Payment
  show: Show
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
