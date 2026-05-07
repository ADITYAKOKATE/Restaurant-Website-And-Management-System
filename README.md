# Premacha Wada | Enterprise Restaurant Management System

A production-grade, full-stack ecosystem designed for high-volume Maharashtrian street food operations. This platform orchestrates a complex, multi-stakeholder workflow involving Customers, Administrators, Kitchen Staff, and Delivery Personnel.

---

## 🏛️ System Architecture

The application is built on a **Decoupled Monolith** architecture, ensuring high performance and ease of deployment.

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router) | High-performance, SEO-optimized user interface with React 19. |
| **Backend** | Node.js + Express.js | Robust RESTful API service with TypeScript for type safety. |
| **Database** | MongoDB (Mongoose) | Scalable NoSQL storage for flexible order and menu schemas. |
| **Authentication** | JWT (httpOnly Cookies) | Stateless authentication with secure, client-side inaccessible tokens. |
| **Styling** | Custom Vanilla CSS | Hand-crafted design system for maximum performance and brand consistency. |

---

## 🔑 Role-Based Access Control (RBAC)

The system enforces strict permission boundaries through specialized middleware, ensuring data integrity and operational security.

### 1. Customer Interface
*   **Menu Engineering**: Dynamic browsing with intelligent filtering and availability checks.
*   **Order Tracking**: State-synchronized polling system (15s intervals) for real-time status visibility.
*   **Profile Management**: Secure storage of personal data, addresses, and order history.

### 2. Administrative Suite
*   **Order Orchestration**: Centralized Kanban board for managing the lifecycle of every transaction.
*   **Financial Verification**: Manual verification protocol for QR-based online payments.
*   **Inventory Control**: Dynamic menu management with real-time price and availability updates.

### 3. Kitchen Management System (KMS)
*   **Preparation Queue**: Optimized order display for kitchen staff to manage throughput.
*   **Status Lifecycle**: One-tap transitions from *Confirmed* → *Preparing* → *Ready for Pickup*.

### 4. Logistics & Delivery
*   **Pickup Workflow**: Role-specific access to "Ready" orders for streamlined logistics.
*   **Delivery Confirmation**: Proof-of-delivery protocol with Cash on Delivery (COD) collection verification.

---

## ⚙️ Core Technical Features

### 📡 Real-Time Order Lifecycle
The system manages a 6-stage order lifecycle with unique sequential token generation:
1.  **Pending**: Initial state upon placement.
2.  **Confirmed**: Admin-verified and sent to kitchen.
3.  **Preparing**: Active preparation in the kitchen.
4.  **Ready**: Packaging complete, awaiting logistics.
5.  **Out for Delivery**: Assigned to delivery personnel.
6.  **Delivered**: Final hand-off and payment reconciliation.

### 🛡️ Security Protocols
*   **Token Security**: JSON Web Tokens (JWT) are strictly delivered via `httpOnly` and `Secure` cookies to mitigate XSS and CSRF risks.
*   **Password Hashing**: Industry-standard **bcryptjs** with 12 salt rounds for credential protection.
*   **CORS Management**: Strict origin-based access control, allowing only authorized frontend communication.
*   **Database Guard**: Schema-level validation using Mongoose to prevent malformed data entry.

### 💳 Transactional Integrity
Supports a dual-payment gateway approach:
*   **Pre-paid (Online)**: QR-based system with mandatory Admin-side reference verification.
*   **Post-paid (COD)**: Logistics-side payment collection with system-wide reconciliation.

---

## 🚀 Deployment & Environment

### Prerequisites
- **Node.js**: v20.x or higher
- **MongoDB**: v7.x (or MongoDB Atlas)
- **Package Manager**: npm v10.x

### Environment Configuration
The backend requires a `.env` file in the root of the `/backend` directory:
```bash
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/premacha-wada
JWT_SECRET=your_32_character_hex_secret
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Installation & Initialization
```bash
# Clone the repository
git clone https://github.com/Weston-tech/w1-premacha-wada.git

# Initialize Backend
cd backend
npm install
npm run build
npm run start

# Initialize Frontend
cd ../frontend
npm install
npm run build
npm run start
```

---

## 📁 Directory Structure Overview

```text
.
├── backend/
│   ├── src/
│   │   ├── lib/          # Database & Auth configuration
│   │   ├── middleware/   # RBAC & Security guards
│   │   ├── models/       # Mongoose data schemas
│   │   ├── routes/       # API endpoint controllers
│   │   └── server.ts     # Core Express application
│   └── tsconfig.json     # Compiler configuration
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js 16 App Router pages
│   │   ├── components/   # Reusable Atomic UI components
│   │   └── context/      # Global State (Auth/Cart) providers
│   └── next.config.ts    # API proxy & build configuration
└── docs/                 # System documentation assets
```

---

## 🍛 Project Mission
**Premacha Wada** is dedicated to preserving the authenticity of Maharashtrian street food while leveraging cutting-edge technology to provide a world-class customer experience.

*Developed with precision for high-performance restaurant operations.*
