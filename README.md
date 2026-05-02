# 🍛 Premacha Vada

> **Authentic Mumbai Street Food** — Full-Stack Restaurant Web Application

A modern, production-grade online ordering platform for Premacha Vada, built with a decoupled Next.js frontend and Express.js backend.

---

## 📁 Project Structure

```
premacha-vada/
│
├── frontend/                          # Next.js App (React 19, TypeScript)
│   ├── src/
│   │   ├── app/                       # App Router pages
│   │   │   ├── layout.tsx             # Root layout (Navbar + Footer wrapper)
│   │   │   ├── page.tsx               # Home page
│   │   │   ├── login/
│   │   │   │   └── page.tsx           # Login page
│   │   │   └── register/
│   │   │       ├── page.tsx           # Register page
│   │   │       └── auth.css           # Shared auth page styles
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar/
│   │   │   │   ├── Navbar.tsx         # Responsive navbar with auth state
│   │   │   │   └── Navbar.css
│   │   │   └── Footer/
│   │   │       ├── Footer.tsx         # Site footer
│   │   │       └── Footer.css
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.tsx        # Global auth state (user, login, logout)
│   │   │
│   │   └── globals.css                # Design system (tokens, buttons, forms, animations)
│   │
│   ├── next.config.ts                 # API proxy → Express backend
│   ├── .env.local                     # Frontend env variables
│   └── package.json
│
├── backend/                           # Express Server (Node.js, TypeScript)
│   ├── src/
│   │   ├── server.ts                  # App entry point, middleware setup
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts                # Mongoose User schema
│   │   │   ├── MenuItem.ts            # Mongoose MenuItem schema
│   │   │   └── Order.ts              # Mongoose Order schema
│   │   │
│   │   ├── routes/
│   │   │   └── auth.ts               # Auth routes: /register /login /logout /me
│   │   │
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts      # requireAuth & requireAdmin guards
│   │   │
│   │   └── lib/
│   │       ├── db.ts                  # MongoDB connection handler
│   │       └── auth.ts                # JWT sign/verify + cookie config
│   │
│   ├── .env                           # Backend env variables
│   └── package.json
│
├── hotel premacha wada 2025.pdf       # Official menu reference
├── .gitignore
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

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd premacha-vada
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
MONGODB_URI=mongodb://localhost:27017/premacha-vada
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Start the backend dev server:

```bash
npm run dev
```

> Backend runs at **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Start the frontend dev server:

```bash
npm run dev
```

> Frontend runs at **http://localhost:3000**

---

## 🔌 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint              | Auth Required | Description                          |
|--------|-----------------------|---------------|--------------------------------------|
| POST   | `/api/auth/register`  | ❌             | Register a new user account          |
| POST   | `/api/auth/login`     | ❌             | Login and receive auth cookie        |
| POST   | `/api/auth/logout`    | ❌             | Clear auth cookie and logout         |
| GET    | `/api/auth/me`        | ✅             | Return the currently logged-in user  |

**Request body for `/register`:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "securePassword123",
  "phone": "+91 98765 43210"
}
```

**Request body for `/login`:**
```json
{
  "email": "rahul@example.com",
  "password": "securePassword123"
}
```

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
| category      | String  | `vada`, `drinks`, `snacks`, `combos`, `desserts` |
| image         | String  | URL to image                                  |
| isAvailable   | Boolean | Default: true                                 |
| isVeg         | Boolean | Default: true                                 |
| isBestseller  | Boolean | Default: false                                |

### Order
| Field               | Type     | Notes                                                          |
|---------------------|----------|----------------------------------------------------------------|
| user                | ObjectId | Ref to User                                                    |
| items               | Array    | `[{ menuItem, name, price, quantity }]`                        |
| totalAmount         | Number   | Required                                                       |
| status              | String   | `pending`, `confirmed`, `preparing`, `ready`, `delivered`, `cancelled` |
| paymentStatus       | String   | `pending`, `paid`, `failed`                                    |
| deliveryAddress     | String   | Optional                                                       |
| phone               | String   | Optional                                                       |
| specialInstructions | String   | Optional                                                       |

---

## 🎨 Design System

The CSS design system lives in `frontend/src/app/globals.css` and provides:

- **Color tokens** — brand orange (`#FF6B35`), gold (`#FFD700`), dark backgrounds
- **Typography** — Outfit (body) + Playfair Display (headings) from Google Fonts
- **Utility classes** — `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.card`, `.glass`
- **Form classes** — `.form-group`, `.form-input`, `.form-label`, `.form-error`
- **Layout** — `.container`, `.section`, `.grid-2`, `.grid-3`, `.grid-4`
- **Animations** — `fadeInUp`, `fadeIn`, `slideInLeft`, `float`, `pulse-glow`
- **Responsive** — Breakpoints at 480px, 768px, and 1024px

---

## 📋 Current Status

| Feature                  | Status        |
|--------------------------|---------------|
| Project architecture     | ✅ Complete   |
| Design system (CSS)      | ✅ Complete   |
| User registration        | ✅ Complete   |
| User login / logout      | ✅ Complete   |
| JWT auth (httpOnly cookie)| ✅ Complete  |
| Navbar (responsive)      | ✅ Complete   |
| Footer                   | ✅ Complete   |
| DB models (User, MenuItem, Order) | ✅ Complete |
| Home page                | 🔄 In Progress |
| Menu page                | 🔄 Planned    |
| Cart functionality       | 🔄 Planned    |
| Order placement          | 🔄 Planned    |
| Order tracking           | 🔄 Planned    |
| Admin panel              | 🔄 Planned    |
| Payment integration      | 🔄 Planned    |

---

## 🔐 Security

- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT stored in **httpOnly cookies** — inaccessible to browser JavaScript
- Cookie set with `sameSite: 'lax'` and `secure: true` in production
- CORS restricted to the configured `FRONTEND_URL` only
- Input validation on both frontend (client-side) and backend (server-side)

---

## 📜 Available Scripts

### Backend
```bash
npm run dev      # Start dev server with nodemon + ts-node
npm run build    # Compile TypeScript to dist/
npm run start    # Run compiled dist/server.js
```

### Frontend
```bash
npm run dev      # Start Next.js dev server (with Turbopack)
npm run build    # Build production bundle
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 📝 License

This project is built for internship/educational purposes.

---

*Made with ❤️ in Mumbai — Premacha Vada 🍛*
