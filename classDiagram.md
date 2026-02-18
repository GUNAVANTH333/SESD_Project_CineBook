# CineBook — Class Diagram

## Overview

The class diagram represents the major classes in the CineBook Movie Theatre Booking Engine, their attributes, methods, and relationships. It highlights OOP principles (abstraction, inheritance, polymorphism) and design patterns (State, Adapter, Repository, Service Layer).

---

## Diagram

```mermaid
classDiagram

    class User {
        +string id
        +string name
        +string email
        +string passwordHash
        +string phone
        +Role role
        +DateTime createdAt
        +register()
        +login()
        +verifyToken()
    }

    class Role {
        <<enumeration>>
        ADMIN
        CUSTOMER
    }

    class Multiplex {
        +string id
        +string name
        +string location
        +string city
        +int totalScreens
        +addScreen()
        +removeScreen()
    }

    class Screen {
        +string id
        +string multiplexId
        +int screenNumber
        +int totalRows
        +int totalColumns
        +int capacity
        +getSeatLayout()
    }

    class Movie {
        +string id
        +string title
        +string genre
        +int durationMinutes
        +string language
        +string rating
        +string posterUrl
        +DateTime releaseDate
        +isNowShowing()
    }

    class Show {
        +string id
        +string movieId
        +string screenId
        +DateTime showTime
        +DateTime endTime
        +float basePrice
        +ShowStatus status
        +getAvailableSeats()
        +hasOverlap()
    }

    class ShowStatus {
        <<enumeration>>
        SCHEDULED
        IN_PROGRESS
        COMPLETED
        CANCELLED
    }

    class Seat {
        <<abstract>>
        +string id
        +string screenId
        +string row
        +int number
        +SeatType type
        +SeatStatus status
        +calculatePrice(float basePrice)*
        +lock(string bookingId)
        +unlock()
        +isAvailable()
    }

    class StandardSeat {
        +float priceMultiplier = 1.0
        +calculatePrice(float basePrice)
    }

    class PremiumSeat {
        +float priceMultiplier = 1.5
        +calculatePrice(float basePrice)
    }

    class ReclinerSeat {
        +float priceMultiplier = 2.0
        +calculatePrice(float basePrice)
    }

    class SeatType {
        <<enumeration>>
        STANDARD
        PREMIUM
        RECLINER
    }

    class SeatStatus {
        <<enumeration>>
        AVAILABLE
        LOCKED
        BOOKED
    }

    class Booking {
        +string id
        +string userId
        +string showId
        +float totalAmount
        +int seatCount
        +BookingStatus status
        +DateTime createdAt
        +DateTime expiresAt
        +int version
        +transitionTo(BookingStatus newStatus)
        +isExpired()
        +calculateTotal()
    }

    class BookingStatus {
        <<enumeration>>
        CREATED
        PENDING_PAYMENT
        CONFIRMED
        CANCELLED
    }

    class BookingSeat {
        +string bookingId
        +string seatId
        +string showId
        +float price
    }

    class Payment {
        +string id
        +string bookingId
        +float amount
        +PaymentStatus status
        +string transactionId
        +string method
        +DateTime paidAt
        +process()
        +refund()
    }

    class PaymentStatus {
        <<enumeration>>
        INITIATED
        SUCCESS
        FAILED
        REFUNDED
    }

    class AuthService {
        +register(name, email, password, phone)
        +login(email, password)
        +verifyToken(token)
        +hashPassword(password)
        +comparePassword(plain, hash)
        +generateToken(userId, role)
    }

    class MovieService {
        +createMovie(movieData)
        +getAllMovies(filters)
        +getMovieById(id)
        +updateMovie(id, data)
        +deleteMovie(id)
    }

    class ShowService {
        +createShow(showData)
        +getShowsByMovie(movieId)
        +getShowsByScreen(screenId)
        +getAvailableSeats(showId)
        +checkOverlap(screenId, showTime, endTime)
    }

    class BookingService {
        +createBooking(userId, showId, seatIds)
        +confirmBooking(bookingId)
        +cancelBooking(bookingId)
        +getBookingsByUser(userId)
        +releaseExpiredLocks()
    }

    class PaymentGatewayAdapter {
        +initiatePayment(amount, bookingId)
        +verifyPayment(transactionId)
        +processRefund(transactionId)
    }

    class IPaymentGateway {
        <<interface>>
        +initiatePayment(amount, bookingId)*
        +verifyPayment(transactionId)*
        +processRefund(transactionId)*
    }

    class InventoryService {
        +lockSeats(showId, seatIds, bookingId)
        +releaseSeats(showId, seatIds)
        +markSeatsBooked(showId, seatIds)
        +getSeatAvailability(showId)
    }

    %% Relationships
    User "1" -- "1" Role
    Multiplex "1" *-- "*" Screen : contains
    Screen "1" *-- "*" Seat : has
    Movie "1" -- "*" Show : screened in
    Screen "1" -- "*" Show : hosts
    Show "1" -- "1" ShowStatus

    Seat <|-- StandardSeat : extends
    Seat <|-- PremiumSeat : extends
    Seat <|-- ReclinerSeat : extends
    Seat "1" -- "1" SeatType
    Seat "1" -- "1" SeatStatus

    User "1" -- "*" Booking : places
    Show "1" -- "*" Booking : for
    Booking "1" -- "1" BookingStatus
    Booking "1" *-- "*" BookingSeat : includes
    BookingSeat "*" -- "1" Seat : references
    Booking "1" -- "0..1" Payment : paid via
    Payment "1" -- "1" PaymentStatus

    IPaymentGateway <|.. PaymentGatewayAdapter : implements

    BookingService ..> InventoryService : uses
    BookingService ..> PaymentGatewayAdapter : uses
    BookingService ..> AuthService : secures
    ShowService ..> MovieService : references
    InventoryService ..> Seat : manages
    BookingService ..> Booking : manages
    MovieService ..> Movie : manages
    ShowService ..> Show : manages
```

---

## Flow Summary

| Phase | Description | Key Patterns |
| :--- | :--- | :--- |
| **1. Modular Architecture** | Services (`AuthService`, `BookingService`, `ShowService`, `InventoryService`) are decoupled and follow single responsibility. | **Service Layer Pattern**, **Separation of Concerns** |
| **2. Secure Authentication** | `AuthService` handles JWT token generation and verification; role-based access restricts admin operations. | **RBAC**, **Token-Based Auth** |
| **3. Seat Abstraction** | Abstract `Seat` class with concrete implementations (`StandardSeat`, `PremiumSeat`, `ReclinerSeat`) each with polymorphic pricing. | **Abstraction**, **Inheritance**, **Polymorphism** |
| **4. Booking Lifecycle** | `Booking` status managed via `BookingStatus` enum with validated transitions (CREATED → PENDING_PAYMENT → CONFIRMED → CANCELLED). | **State Pattern**, **Enum Strategy** |
| **5. Payment Adapter** | `PaymentGatewayAdapter` implements `IPaymentGateway` to decouple the booking engine from third-party payment providers. | **Adapter Pattern**, **Dependency Inversion** |
| **6. Concurrency Control** | `InventoryService` locks seats atomically and uses versioning on `Booking` to prevent double-booking. | **Pessimistic Locking**, **Optimistic Locking** |
