# CineBook — ER Diagram

## Overview

The ER diagram represents the database schema for the CineBook Movie Theatre Booking Engine. It covers users, multiplexes, screens, seat layouts, movies, shows, bookings, booking-seat mappings, and payments. Key concepts include optimistic locking (version fields), audit trails, and state persistence.

---

## Diagram

```mermaid
erDiagram

    USERS {
        string id PK
        string name
        string email UK
        string password_hash
        string phone
        string role "ADMIN | CUSTOMER"
        datetime created_at
        datetime updated_at
    }

    MULTIPLEXES {
        string id PK
        string name
        string location
        string city
        int total_screens
        datetime created_at
    }

    SCREENS {
        string id PK
        string multiplex_id FK
        int screen_number
        int total_rows
        int total_columns
        int capacity
    }

    MULTIPLEXES ||--o{ SCREENS : contains

    MOVIES {
        string id PK
        string title
        string genre
        int duration_minutes
        string language
        string rating
        string poster_url
        date release_date
        datetime created_at
    }

    SHOWS {
        string id PK
        string movie_id FK
        string screen_id FK
        datetime show_time
        datetime end_time
        float base_price
        string status "SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED"
        datetime created_at
    }

    MOVIES ||--o{ SHOWS : "screened in"
    SCREENS ||--o{ SHOWS : hosts

    SEATS {
        string id PK
        string screen_id FK
        string row_label
        int seat_number
        string seat_type "STANDARD | PREMIUM | RECLINER"
        float price_multiplier
    }

    SCREENS ||--o{ SEATS : "has layout"

    SHOW_SEATS {
        string id PK
        string show_id FK
        string seat_id FK
        string status "AVAILABLE | LOCKED | BOOKED"
        string locked_by_booking_id FK
        datetime lock_expires_at
        int version "Optimistic Lock"
    }

    SHOWS ||--o{ SHOW_SEATS : "has availability"
    SEATS ||--o{ SHOW_SEATS : "tracked per show"

    BOOKINGS {
        string id PK
        string user_id FK
        string show_id FK
        float total_amount
        int seat_count
        string status "CREATED | PENDING_PAYMENT | CONFIRMED | CANCELLED"
        datetime created_at
        datetime expires_at
        int version "Optimistic Lock"
        datetime updated_at
    }

    USERS ||--o{ BOOKINGS : places
    SHOWS ||--o{ BOOKINGS : "booked for"

    BOOKING_SEATS {
        string id PK
        string booking_id FK
        string show_seat_id FK
        float price
    }

    BOOKINGS ||--o{ BOOKING_SEATS : contains
    SHOW_SEATS ||--o{ BOOKING_SEATS : "reserved in"

    PAYMENTS {
        string id PK
        string booking_id FK
        float amount
        string status "INITIATED | SUCCESS | FAILED | REFUNDED"
        string transaction_id UK
        string payment_method
        datetime paid_at
        datetime created_at
    }

    BOOKINGS ||--o| PAYMENTS : "paid via"

    BOOKING_LOGS {
        string id PK
        string booking_id FK
        string previous_status
        string new_status
        string changed_by
        datetime timestamp
    }

    BOOKINGS ||--o{ BOOKING_LOGS : "has history"

```

---

## Flow Summary

| Phase | Description | Key Concepts |
| :--- | :--- | :--- |
| **1. Data Integrity** | `USERS` stores `password_hash` instead of plain text; emails are unique. | **Hashing**, **Security Best Practices** |
| **2. Seat Management** | `SHOW_SEATS` tracks per-show seat availability separately from the static `SEATS` layout. | **Normalization**, **State Separation** |
| **3. Concurrency Control** | `SHOW_SEATS.version` and `BOOKINGS.version` enable optimistic locking for atomic updates. | **Optimistic Locking**, **Versioning** |
| **4. Booking Lifecycle** | `BOOKINGS.status` tracks the progression (CREATED → PENDING_PAYMENT → CONFIRMED → CANCELLED). | **State Persistence**, **Enum Mapping** |
| **5. Audit Trail** | `BOOKING_LOGS` records every status transition for accountability and debugging. | **Audit Logging**, **Event Sourcing (Lite)** |
| **6. Payment Tracking** | `PAYMENTS` table links to bookings with its own lifecycle (INITIATED → SUCCESS → FAILED → REFUNDED). | **Transaction Tracking**, **Idempotency** |
