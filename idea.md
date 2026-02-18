# CineBook — Movie Theatre Booking Engine

## Project Overview

**CineBook** is a full-stack movie theatre booking engine that manages multiplexes, movie shows, seat layouts, and booking transactions. It simulates a real-world cinema booking platform where users can browse movies, select showtimes, choose seats, and complete bookings with payment processing.

The backend is engineered to handle **concurrency** (two users cannot book the same seat simultaneously), apply **OOP principles**, and leverage **design patterns** to produce clean, maintainable, and production-grade code.

---

## Scope

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js (Vite) |
| **Backend** | Node.js + Express.js (TypeScript) |
| **Database** | PostgreSQL (via Prisma ORM) |
| **Authentication** | JWT-based (Access + Refresh Tokens) |
| **Architecture** | Controller → Service → Repository (layered) |

---

## Key Features

### 1. User Management
- User registration and login with hashed passwords (bcrypt)
- JWT-based authentication with role-based access control
- Roles: **ADMIN**, **CUSTOMER**
- Admins manage movies, theatres, and shows; customers browse and book

### 2. Multiplex & Theatre Management
- CRUD for multiplexes (name, location, number of screens)
- CRUD for screens within a multiplex (screen number, seat layout metadata)
- Seat types: **STANDARD**, **PREMIUM**, **RECLINER** — each with its own pricing

### 3. Movie & Show Management
- CRUD for movies (title, genre, duration, language, rating, poster)
- Schedule shows by assigning a movie to a screen with a date/time slot
- Prevent overlapping shows on the same screen

### 4. Seat Layout & Selection
- Dynamic seat map per screen (rows × columns)
- Real-time seat availability check per show
- Seat status: **AVAILABLE**, **LOCKED**, **BOOKED**

### 5. Booking Engine (Core)
- **Concurrency-safe booking** using pessimistic/optimistic locking
- Temporary seat lock on selection (TTL-based) to prevent double booking
- Booking lifecycle: **CREATED → PENDING_PAYMENT → CONFIRMED → CANCELLED**
- Automatic release of locked seats on timeout or cancellation

### 6. Payment Simulation
- Adapter Pattern to simulate a third-party payment gateway
- Payment states: **INITIATED → SUCCESS → FAILED → REFUNDED**
- On payment success → confirm booking; on failure → release seats

### 7. Booking History & Admin Dashboard
- Customers: view past bookings, download e-ticket (PDF stub)
- Admins: view all bookings, revenue per show/screen, occupancy analytics

---

## Software Engineering Practices

### OOP Principles
| Principle | Application |
| :--- | :--- |
| **Encapsulation** | Services encapsulate business logic; repositories encapsulate data access |
| **Abstraction** | Abstract `Seat` class with concrete types: `StandardSeat`, `PremiumSeat`, `ReclinerSeat` |
| **Inheritance** | Seat type hierarchy inherits from a base `Seat` class |
| **Polymorphism** | `calculatePrice()` method behaves differently per seat type |

### Design Patterns
| Pattern | Usage |
| :--- | :--- |
| **State Pattern** | Booking status transitions (Created → Pending → Confirmed → Cancelled) with validation at each transition |
| **Adapter Pattern** | `PaymentGatewayAdapter` wraps a simulated third-party payment API behind a uniform interface |
| **Repository Pattern** | Data access layer abstracted behind repository interfaces |
| **Service Layer Pattern** | Business logic decoupled from controllers and data access |

### Clean Architecture
```
src/
├── controllers/    # HTTP request handling
├── services/       # Business logic
├── repositories/   # Data access (Prisma)
├── models/         # Domain entities & enums
├── adapters/       # External service adapters (Payment)
├── middleware/      # Auth, validation, error handling
├── routes/         # Express route definitions
├── utils/          # Helpers (token, hashing, etc.)
└── config/         # App & DB configuration
```

### Concurrency Control
- **Pessimistic Locking**: `SELECT ... FOR UPDATE` on seat rows during booking transaction
- **Optimistic Locking**: Version field on seats to detect concurrent modifications
- **TTL-based Seat Lock**: Temporary lock expires if payment is not completed within the window

### Other Practices
- Input validation (Zod / class-validator)
- Centralized error handling middleware
- Environment-based configuration
- Regular, atomic Git commits with meaningful messages
