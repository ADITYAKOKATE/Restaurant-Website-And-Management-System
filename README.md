# 🍛 Premacha Wada

> **Authentic Maharashtrian Street Food** — Full-Stack Restaurant Web Application

A modern, production-grade online ordering platform for Premacha Wada, built with a decoupled Next.js frontend and Express.js backend.

---

## 📁 Project Structure

```
premacha-wada/
│
├── frontend/                          # Next.js App (React 19, TypeScript)
│   ├── src/
│   │   ├── app/                       # App Router pages
│   │   │   ├── layout.tsx             # Root layout (Navbar + Footer wrapper)
│   │   │   ├── page.tsx               # Home page
│   │   │   ├── login/                 # Login page
│   │   │   ├── register/              # Register page
│   │   │   ├── menu/                  # Menu page with filtering & cart add
│   │   │   ├── cart/                  # Cart & Checkout page
│   │   │   ├── orders/                # Orders tracking & history page
│   │   │   └── profile/               # User profile management page
│   │   │
│   │   ├── components/                # Reusable UI components (Navbar, Footer, Home, etc.)
│   │   ├── context/                   # Global state (AuthContext, CartContext)
│   │   └── globals.css                # Design system (tokens, utilities, responsive layout)
│   │
│   ├── public/                        # Static assets (images, PDF menus)
│   ├── next.config.ts                 # API proxy → Express backend
│   └── package.json
│
├── backend/                           # Express Server (Node.js, TypeScript)
│   ├── src/
│   │   ├── server.ts                  # App entry point, middleware setup
│   │   │
│   │   ├── models/                    # Mongoose schemas (User, MenuItem, Order, Cart)
│   │   ├── routes/                    # API routes (auth, menu, cart, order)
│   │   ├── middleware/                # requireAuth & requireAdmin guards
│   │   ├── scripts/                   # Data seeding scripts (seedMenu)
│   │   └── lib/                       # DB connection & Auth utilities
│   │
│   ├── .env                           # Backend env variables
│   └── package.json
│
└── README.md
```

---

## 🛠 Tech Stack

| Layer        | Technology                            |
|--------------|---------------------------------------|
| Frontend     | Next.js 16, React 19, TypeScript      |
| Styling      | Vanilla CSS with custom design system |
| Backend      | Express.js 4, Node.js, TypeScript     |
| Database     | MongoDB with Mongoose ODM             |
| Auth         | JWT (jsonwebtoken) + httpOnly Cookies |
| Password     | bcryptjs (12 salt rounds)             |
| Dev Tools    | ts-node, nodemon, ESLint              |

---

## ⚙️ Architecture

```
Browser
  │
  ▼
Next.js Frontend (port 3000)
  │  fetch('/api/...')
  │
  ▼  [next.config.ts proxy rewrite]
  │
Express Backend (port 5000)
  │
  ▼
MongoDB (local / Atlas)
```

- **Frontend** makes all API calls to `/api/*`
- **Next.js** rewrites `/api/*` → `http://localhost:5000/api/*` (see `next.config.ts`)
- **Backend** handles all DB operations, business logic, and auth
- **JWT** tokens are stored in `httpOnly` cookies — never exposed to JavaScript

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally on port `27017`, **OR** a MongoDB Atlas connection string

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
MONGODB_URI=mongodb://localhost:27017/premacha-wada
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Start the backend dev server:

```bash
npm run dev
```

> Backend runs at **http://localhost:5000**

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend dev server:

```bash
npm run dev
```

> Frontend runs at **http://localhost:3000**

---

## 🔌 Core API Reference

### Auth Routes — `/api/auth`
| Method | Endpoint              | Auth Required | Description                          |
|--------|-----------------------|---------------|--------------------------------------|
| POST   | `/api/auth/register`  | ❌             | Register a new user account          |
| POST   | `/api/auth/login`     | ❌             | Login and receive auth cookie        |
| POST   | `/api/auth/logout`    | ❌             | Clear auth cookie and logout         |
| GET    | `/api/auth/me`        | ✅             | Return the currently logged-in user  |
| GET    | `/api/auth/profile`   | ✅             | Return user profile data             |
| PATCH  | `/api/auth/profile`   | ✅             | Update user profile data             |

### Order Routes — `/api/orders`
| Method | Endpoint              | Auth Required | Description                          |
|--------|-----------------------|---------------|--------------------------------------|
| POST   | `/api/orders`         | ✅             | Place a new order (Checkout)         |
| GET    | `/api/orders`         | ✅             | Get user's order history             |
| GET    | `/api/orders/:id`     | ✅             | Get specific order details           |

---

## 🗄️ Database Models

### User
| Field     | Type     | Notes                    |
|-----------|----------|--------------------------|
| name      | String   | Required, max 100 chars  |
| email     | String   | Required, unique         |
| password  | String   | Hashed with bcrypt       |
| phone     | String   | Optional                 |
| address   | String   | Optional                 |
| role      | String   | `user` or `admin`        |

### MenuItem
| Field         | Type    | Notes                                         |
|---------------|---------|-----------------------------------------------|
| name          | String  | Required                                      |
| description   | String  | Required                                      |
| price         | Number  | Required, min 0                               |
| category      | String  | Menu section                                  |
| image         | String  | URL to image                                  |
| isVeg         | Boolean | Default: true                                 |

### Order
| Field               | Type     | Notes                                                          |
|---------------------|----------|----------------------------------------------------------------|
| user                | ObjectId | Ref to User                                                    |
| items               | Array    | `[{ menuItem, name, price, quantity, image }]`                 |
| totalAmount         | Number   | Required                                                       |
| tokenNumber         | Number   | Unique order queue number                                      |
| orderType           | String   | `delivery`, `dine_in`                                          |
| paymentMethod       | String   | `online`, `cod`                                                |
| status              | String   | `pending`, `confirmed`, `preparing`, `ready`, `delivered`, `cancelled` |
| paymentStatus       | String   | `pending`, `paid`, `failed`                                    |

---

## 📋 Current Status

| Phase | Feature                  | Status        |
|-------|--------------------------|---------------|
| **Phase 1** | Foundation & Auth (Register, Login, JWT, DB, Setup) | ✅ Complete   |
| **Phase 2** | Menu & Cart (Menu List, Filtering, Cart State, Sync) | ✅ Complete   |
| **Phase 3** | Checkout & Orders (Checkout Form, Token Gen, History)| ✅ Complete   |
| **Phase 4A**| Customer Polish (Profile Page, Live Status Polling)  | ✅ Complete   |
| **Phase 4B**| Admin Panel (Kanban, Stats, Menu Management)         | 🔄 Handoff Ready |

---

## 🔐 Security

- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT stored in **httpOnly cookies** — inaccessible to browser JavaScript
- Cookie set with `sameSite: 'lax'` and `secure: true` in production
- CORS restricted to the configured `FRONTEND_URL` only
- Input validation on both frontend (client-side) and backend (server-side)

---

*Made with ❤️ in Pune — Premacha Wada 🍛*
