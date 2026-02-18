# CineBook — Sequence Diagram

## Overview

The sequence diagram illustrates the **main booking flow end-to-end** in the CineBook Movie Theatre Booking Engine. It covers authentication, seat availability check, seat locking (concurrency control), booking creation, payment processing via the Adapter Pattern, and booking confirmation — all within a transactional scope.

---

## Diagram

```mermaid
sequenceDiagram
    participant Customer as Customer (Browser)
    participant API as API Gateway
    participant Auth as AuthService
    participant ShowSvc as ShowService
    participant BookingSvc as BookingService
    participant InvSvc as InventoryService
    participant PayAdapter as PaymentGatewayAdapter
    participant DB as Database

    %% Step 1: Authentication
    Customer->>API: POST /auth/login (email, password)
    API->>Auth: authenticate(email, password)
    Auth->>DB: SELECT user WHERE email = ?
    DB-->>Auth: User record
    Auth-->>API: JWT Token (role: CUSTOMER)
    API-->>Customer: 200 OK (accessToken)

    %% Step 2: Browse Shows
    Customer->>API: GET /movies/:movieId/shows (Token)
    API->>Auth: verifyToken(token)
    Auth-->>API: Token Valid
    API->>ShowSvc: getShowsByMovie(movieId)
    ShowSvc->>DB: SELECT shows WHERE movie_id = ?
    DB-->>ShowSvc: List of Shows
    ShowSvc-->>API: Shows[]
    API-->>Customer: 200 OK (shows list)

    %% Step 3: View Available Seats
    Customer->>API: GET /shows/:showId/seats (Token)
    API->>InvSvc: getSeatAvailability(showId)
    InvSvc->>DB: SELECT show_seats WHERE show_id = ? AND status = AVAILABLE
    DB-->>InvSvc: Available Seats
    InvSvc-->>API: AvailableSeats[]
    API-->>Customer: 200 OK (seat map)

    %% Step 4: Create Booking (Lock Seats)
    Customer->>API: POST /bookings (Token, showId, seatIds[])
    API->>Auth: verifyToken(token)
    Auth-->>API: Token Valid (userId)
    API->>BookingSvc: createBooking(userId, showId, seatIds)

    Note over BookingSvc, DB: Transaction Scope Start

    BookingSvc->>InvSvc: lockSeats(showId, seatIds, bookingId)
    InvSvc->>DB: SELECT show_seats FOR UPDATE WHERE id IN (seatIds) AND status = AVAILABLE
    DB-->>InvSvc: Seats Locked (rows returned)

    alt Seats Available
        InvSvc->>DB: UPDATE show_seats SET status = LOCKED, locked_by = bookingId, lock_expires_at = NOW + 10min
        DB-->>InvSvc: Rows Updated
        InvSvc-->>BookingSvc: Seats Locked Successfully
    else Seats Already Taken
        InvSvc-->>BookingSvc: Error: Seats Unavailable
        BookingSvc-->>API: 409 Conflict (seats taken)
        API-->>Customer: 409 Conflict
    end

    BookingSvc->>DB: INSERT INTO bookings (status: CREATED, expires_at: NOW + 10min)
    DB-->>BookingSvc: Booking Created
    BookingSvc->>DB: INSERT INTO booking_seats (bookingId, seatIds, prices)
    DB-->>BookingSvc: Booking Seats Saved

    Note over BookingSvc, DB: Transaction Scope End

    BookingSvc-->>API: Booking Created (bookingId, status: CREATED)
    API-->>Customer: 201 Created (bookingId, expiresAt)

    %% Step 5: Process Payment
    Customer->>API: POST /payments (Token, bookingId, paymentMethod)
    API->>BookingSvc: processPayment(bookingId)

    BookingSvc->>BookingSvc: transitionTo(PENDING_PAYMENT)
    BookingSvc->>DB: UPDATE bookings SET status = PENDING_PAYMENT

    BookingSvc->>PayAdapter: initiatePayment(amount, bookingId)

    Note over PayAdapter: Adapter Pattern - wraps 3rd party gateway

    PayAdapter-->>BookingSvc: transactionId, paymentStatus

    alt Payment Successful
        BookingSvc->>DB: INSERT INTO payments (status: SUCCESS)
        BookingSvc->>BookingSvc: transitionTo(CONFIRMED)
        BookingSvc->>DB: UPDATE bookings SET status = CONFIRMED
        BookingSvc->>InvSvc: markSeatsBooked(showId, seatIds)
        InvSvc->>DB: UPDATE show_seats SET status = BOOKED
        DB-->>InvSvc: Seats Confirmed
        BookingSvc->>DB: INSERT INTO booking_logs (PENDING_PAYMENT → CONFIRMED)

        BookingSvc-->>API: Booking Confirmed
        API-->>Customer: 200 OK (booking confirmed, e-ticket)
    else Payment Failed
        BookingSvc->>DB: INSERT INTO payments (status: FAILED)
        BookingSvc->>BookingSvc: transitionTo(CANCELLED)
        BookingSvc->>DB: UPDATE bookings SET status = CANCELLED
        BookingSvc->>InvSvc: releaseSeats(showId, seatIds)
        InvSvc->>DB: UPDATE show_seats SET status = AVAILABLE, locked_by = NULL
        DB-->>InvSvc: Seats Released
        BookingSvc->>DB: INSERT INTO booking_logs (PENDING_PAYMENT → CANCELLED)

        BookingSvc-->>API: Payment Failed, Booking Cancelled
        API-->>Customer: 402 Payment Failed
    end
```

---

## Flow Summary

| Phase | Description | Key Patterns |
| :--- | :--- | :--- |
| **1. Secure Entry** | Request hits API Gateway → `AuthService` verifies JWT token and extracts user role. | **Token-Based Auth**, **RBAC** |
| **2. Browse & Select** | `ShowService` retrieves available shows; `InventoryService` provides real-time seat availability. | **Service Layer**, **Read Optimization** |
| **3. Seat Locking** | `InventoryService` uses `SELECT ... FOR UPDATE` to pessimistically lock seats, preventing double-booking. | **Pessimistic Locking**, **Concurrency Control** |
| **4. Booking Creation** | Booking and seat reservations saved within a single database transaction with TTL-based expiry. | **Transactional Safety**, **TTL-Based Locks** |
| **5. Payment Processing** | `PaymentGatewayAdapter` wraps the third-party payment API, decoupling the booking engine from external systems. | **Adapter Pattern**, **Dependency Inversion** |
| **6. State Transition** | Booking status transitions are validated (CREATED → PENDING_PAYMENT → CONFIRMED / CANCELLED) with audit logs. | **State Pattern**, **Audit Logging** |
