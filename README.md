# Bhavishya Aqua Feeds & Needs — Business Management System

A full-stack MERN application for managing sales, returns, stock, customer history, and reports.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router 6, Chart.js |
| Backend   | Node.js, Express 4                |
| Database  | MongoDB with Mongoose             |
| Auth      | JWT (JSON Web Tokens)             |
| Styling   | Custom CSS design system          |

---

## Project Structure

```
bhavishya-aqua/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── productController.js
│   │   ├── saleController.js
│   │   ├── returnController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   └── auth.js              # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Product.js
│   │   ├── Sale.js              # Embedded SaleItems
│   │   └── Return.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── products.js
│   │   ├── sales.js
│   │   ├── returns.js
│   │   └── reports.js
│   ├── seed.js                  # One-time DB seed script
│   ├── server.js                # Entry point
│   ├── .env                     # Environment variables
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Alert.js
        │   └── Layout.js
        ├── context/
        │   └── AuthContext.js
        ├── pages/
        │   ├── Login.js
        │   ├── Dashboard.js
        │   ├── Sale.js
        │   ├── Return.js
        │   ├── History.js
        │   ├── Stock.js
        │   ├── Reports.js
        │   └── Search.js
        ├── utils/
        │   └── api.js           # Axios instance + interceptors
        ├── App.js
        ├── index.js
        ├── index.css            # Full custom design system
        └── package.json
```

---

## Prerequisites

- Node.js v18 or higher
- MongoDB v6 or higher (local or Atlas)
- npm v9 or higher

---

## Setup Instructions

### 1. Clone / Extract the project

```bash
cd bhavishya-aqua
```

### 2. Configure Backend Environment

The `.env` file is already present in `backend/`. Edit it if needed:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bhavishya_aqua
JWT_SECRET=bhavishya_aqua_jwt_secret_2024_change_this_in_production
JWT_EXPIRES_IN=7d
```

For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

### 3. Install Backend Dependencies & Seed Database

```bash
cd backend
npm install

# Seed the database (creates admin user + 10 sample products)
node seed.js
```

This creates:
- **Admin user** → `username: admin` | `password: admin123`
- 10 sample aqua feed products with stock

### 4. Start Backend Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Backend runs at: `http://localhost:5000`

### 5. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 6. Start Frontend

```bash
npm start
```

Frontend runs at: `http://localhost:3000`

The `"proxy": "http://localhost:5000"` in `frontend/package.json` routes all `/api/*` calls to the backend automatically during development.

---

## Default Login

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

**Change this password after first login in production.**

---

## API Endpoints

### Authentication
| Method | Endpoint            | Description          | Auth |
|--------|---------------------|----------------------|------|
| POST   | `/api/auth/login`   | Login, get JWT token | No   |
| POST   | `/api/auth/register`| Register new user    | No   |
| GET    | `/api/auth/me`      | Get current user     | Yes  |

### Customers
| Method | Endpoint                      | Description                  |
|--------|-------------------------------|------------------------------|
| GET    | `/api/customers`              | List all customers           |
| GET    | `/api/customers/search?q=`    | Search by name or phone      |
| GET    | `/api/customers/:id`          | Get customer + sales history |
| POST   | `/api/customers`              | Create customer              |
| PUT    | `/api/customers/:id`          | Update customer              |

### Products
| Method | Endpoint                        | Description           |
|--------|---------------------------------|-----------------------|
| GET    | `/api/products`                 | List all products     |
| GET    | `/api/products/:id`             | Get single product    |
| POST   | `/api/products`                 | Create product        |
| PUT    | `/api/products/:id`             | Update product        |
| PATCH  | `/api/products/:id/stock`       | Add stock manually    |
| DELETE | `/api/products/:id`             | Delete product        |

### Sales
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| GET    | `/api/sales`                      | List all sales (paginated)|
| GET    | `/api/sales/:id`                  | Get sale details         |
| GET    | `/api/sales/customer/:customerId` | Sales by customer        |
| POST   | `/api/sales`                      | Create new sale          |

### Returns
| Method | Endpoint                            | Description           |
|--------|-------------------------------------|-----------------------|
| GET    | `/api/returns`                      | List all returns      |
| GET    | `/api/returns/customer/:customerId` | Returns by customer   |
| POST   | `/api/returns`                      | Process a return      |

### Reports
| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/api/reports?type=daily`         | Report: daily/weekly/monthly/yearly|
| GET    | `/api/reports/summary`            | Dashboard summary cards            |

---

## MongoDB Schema Overview

### User
```js
{ name, username (unique), password (hashed), role: ['admin','staff'] }
```

### Customer
```js
{ name, phone (unique), address, totalSpent }
```

### Product
```js
{ name (unique), category, unit, rate, stock, description }
```

### Sale
```js
{
  customer (ref), customerName, customerPhone,
  items: [{ product (ref), productName, rate, quantity, discount, subtotal }],
  totalAmount, totalDiscount, paymentMode, notes, createdBy (ref), saleDate
}
```

### Return
```js
{
  originalSale (ref), customer (ref), customerName, customerPhone,
  product (ref), productName, quantity, rate, refundAmount,
  reason, processedBy (ref), returnDate
}
```

---

## Business Logic

- **Stock deduction** on sale is atomic (MongoDB transaction)
- **Stock restoration** on return is atomic (MongoDB transaction)
- **Customer auto-created** on first sale if not found by phone
- **Return validation**: cannot return more than purchased quantity; tracks previously returned quantities
- **customerTotalSpent** auto-updates on every sale and return
- JWT token is stored in `localStorage` and sent via `Authorization: Bearer` header

---

## Production Deployment Notes

1. Set a strong `JWT_SECRET` in `.env`
2. Set your MongoDB Atlas `MONGO_URI`
3. Build the frontend: `cd frontend && npm run build`
4. Serve the `build/` folder as static files from Express or a CDN
5. Remove or protect the `/api/auth/register` endpoint
6. Use HTTPS in production
7. Consider rate limiting the auth endpoints

---

## Features Summary

- JWT authentication with protected routes
- Customer autocomplete on sale form
- Multi-item sale with auto stock deduction
- Return with quantity validation and stock restoration
- Purchase history per customer
- Product catalog with stock management
- Reports: daily / weekly / monthly / yearly with Chart.js bar chart
- Top 5 products by revenue
- Customer search with full profile view
- Responsive design with custom design system
- Success/error alerts with auto-dismiss
- Loading states throughout
