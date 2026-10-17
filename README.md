# StockPilot - Full-Stack Inventory Management System

StockPilot is a full-stack web application for managing products, categories, suppliers, and stock
movements. It features JWT authentication, product CRUD, search/filter/sorting, image upload,
low-stock alerts, dashboard analytics, and a responsive React UI.

> Backend: **Java 17+ / Spring Boot 3** · Database: **PostgreSQL** (H2 dev profile included) · Frontend: **React + Vite + Tailwind CSS**

---

## Features

### Core features

| Capability | Implementation |
|---|---|
| Authentication | JWT login & registration with BCrypt password hashing |
| Inventory management | Full CRUD for products, categories, suppliers and stock movements |
| Relational data | PostgreSQL via Spring Data JPA (H2 in-memory profile for quick demos) |
| REST API | JSON endpoints under `/api/**` |
| Decoupled architecture | Standalone React SPA consuming the REST API |

### Additional features

- **JWT authentication** - stateless tokens, protected API routes, auto-logout on 401
- **Search / filter / sorting** - keyword search, category filter, sort by name/price/stock/date, asc/desc
- **File / image upload** - product images uploaded to server and served from `/uploads/**`
- **Application logging** - SLF4J/Logback logging across services and controllers
- **Responsive / clean UI** - Tailwind CSS dashboard that works on mobile and desktop
- **Low-stock alerts** - stock badges (green / amber / red) and dashboard KPIs
- **Atomic stock movements** - stock IN/OUT updates product quantity transactionally and blocks negative stock

---

## Tech Stack

**Backend:** Java 21 (compatible with 17+), Spring Boot 3.3, Spring Web, Spring Data JPA, Spring
Security 6, JJWT 0.11.5, Lombok, Maven, PostgreSQL / H2, Bean Validation, SLF4J.

**Frontend:** React 18, Vite 5, React Router 6, Axios, Tailwind CSS 3.

---

## Project Structure

```
stockpilot-fullstack-app/
├── backend/                  # Spring Boot REST API
│   ├── src/main/java/com/stockpilot/
│   │   ├── config/           # SecurityConfig, WebConfig (static /uploads)
│   │   ├── controller/       # Auth, Product, Category, Supplier, StockMovement, Dashboard, Upload
│   │   ├── dto/              # Request/Response DTOs with validation
│   │   ├── entity/           # User, Category, Supplier, Product, StockMovement
│   │   ├── exception/        # Global exception handler + custom exceptions
│   │   ├── repository/       # Spring Data JPA repositories
│   │   ├── security/         # JwtUtil, JwtAuthenticationFilter, UserDetailsService
│   │   └── service/          # Business logic (transactional)
│   └── src/main/resources/   # application.properties, application-dev.properties (H2)
├── frontend/                 # React SPA (Vite)
│   ├── src/components/       # Layout (nav + header)
│   ├── src/context/          # AuthContext (JWT storage)
│   ├── src/pages/            # Login, Register, Dashboard, Products, Categories, Suppliers, StockMovements
│   └── src/services/         # Axios instance with JWT interceptor
├── docker-compose.yml        # PostgreSQL for local development
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Java 17+ (JDK)
- Maven (or use the included `mvnw` wrapper)
- Node.js 18+ and npm
- PostgreSQL 14+ *(optional - or use the built-in H2 dev profile)*

### 1. Database (PostgreSQL)

Start PostgreSQL (or use `docker compose up -d db` if you have Docker), then create the database:

```sql
CREATE DATABASE stockpilot;
```

Update credentials in `backend/src/main/resources/application.properties` if needed
(default user/password is `postgres`/`postgres`; Hibernate creates the tables on startup).

### 2. Backend

```bash
cd backend

# Option A: PostgreSQL (default)
mvn spring-boot:run

# Option B: H2 in-memory database - no install needed (Windows: run-dev.cmd)
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend runs at **http://localhost:8080**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** - open it, register an account, and start managing inventory.

---

## API Documentation

All endpoints are JSON. Protected endpoints require header: `Authorization: Bearer <token>`.

### Authentication - `/api/auth` (public)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register (`name`, `email`, `password`) - returns JWT |
| POST | `/api/auth/login` | Login (`email`, `password`) - returns JWT |

### Products - `/api/products` (protected)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products?keyword=&categoryId=&sortBy=&direction=` | List with unified search / filter / sort |
| GET | `/api/products/{id}` | Get one product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |

`sortBy`: `id`, `name`, `price`, `quantity` · `direction`: `asc`, `desc`

### Categories - `/api/categories` (protected)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | List all |
| GET | `/api/categories/{id}` | Get one |
| POST | `/api/categories` | Create |
| PUT | `/api/categories/{id}` | Update |
| DELETE | `/api/categories/{id}` | Delete (blocked if products are assigned) |

### Suppliers - `/api/suppliers` (protected)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/suppliers` | List all |
| POST | `/api/suppliers` | Create |
| PUT | `/api/suppliers/{id}` | Update |
| DELETE | `/api/suppliers/{id}` | Delete (blocked if products are linked) |

### Stock Movements - `/api/stock-movements` (protected)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stock-movements` | Latest 10 movements |
| GET | `/api/stock-movements/product/{productId}` | Movements for one product |
| POST | `/api/stock-movements` | Record `IN`/`OUT` (atomic, blocks negative stock) |

### Upload - `/api/upload` (protected)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload` | Multipart `file` upload (JPG/PNG/GIF/WEBP) - returns `{ "url": "/uploads/..." }` |

### Dashboard - `/api/dashboard` (protected)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Totals, low-stock/out-of-stock counts, recent movements |

### Example

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@stockpilot.com","password":"secret123"}'

# Use the returned token
curl "http://localhost:8080/api/products?keyword=phone&sortBy=price&direction=asc" \
  -H "Authorization: Bearer <token>"
```

---

## Database Design

```
users(id, name, email, password, role, created_at)

categories(id, name, description)

suppliers(id, name, email, phone, address)

products(id, name, description, price, quantity, image_url,
         category_id FK, supplier_id FK, created_at, updated_at)

stock_movements(id, product_id FK, type[IN|OUT], quantity, note, created_at)
```

Relationships: a product belongs to one category and one supplier; a product has many stock movements.

---

## Security Notes

- Passwords are hashed with BCrypt.
- JWT secret & expiry are configurable in `application.properties` (`app.jwt.secret`, `app.jwt.expiration`).
- Only `/api/auth/**` and `/uploads/**` are public; everything else requires a valid token.
- Change the default JWT secret before any real deployment.
