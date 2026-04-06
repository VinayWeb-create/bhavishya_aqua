# Bhavishya Aqua Feeds & Needs — API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
All endpoints except `/auth/login` require JWT token in `Authorization: Bearer <token>` header.

## Endpoints

### Authentication
- `POST /auth/login` - Login user
  - Body: `{ "username": "string", "password": "string" }`
  - Response: `{ "token": "string", "user": { "id": "string", "name": "string", "role": "string" } }`

- `GET /auth/me` - Get current user info (protected)

### Customers
- `GET /customers` - Get all customers (protected)
- `GET /customers/search?q=<query>` - Search customers by name or phone (protected)
- `GET /customers/:id` - Get customer by ID (protected)
- `POST /customers` - Create new customer (protected)
  - Body: `{ "name": "string", "phone": "string", "address": "string" }`
- `PUT /customers/:id` - Update customer (protected)

### Products
- `GET /products` - Get all products (protected)
- `GET /products/:id` - Get product by ID (protected)
- `POST /products` - Create new product (protected)
  - Body: `{ "name": "string", "category": "string", "unit": "string", "rate": number, "stock": number, "description": "string" }`
- `PUT /products/:id` - Update product (protected)
- `PATCH /products/:id/stock` - Add stock to product (protected)
  - Body: `{ "quantity": number }`
- `DELETE /products/:id` - Delete product (protected)

### Sales
- `GET /sales` - Get all sales (protected)
- `GET /sales/customer/:customerId` - Get sales by customer (protected)
- `GET /sales/:id` - Get sale by ID (protected)
- `POST /sales` - Create new sale (protected)
  - Body: `{ "customerName": "string", "customerPhone": "string", "customerAddress": "string", "items": [{ "productId": "string", "rate": number, "quantity": number, "discount": number }], "paymentMode": "string", "notes": "string" }`

### Returns
- `GET /returns` - Get all returns (protected)
- `GET /returns/customer/:customerId` - Get returns by customer (protected)
- `POST /returns` - Create new return (protected)
  - Body: `{ "customerId": "string", "saleId": "string", "items": [{ "productId": "string", "quantity": number }], "reason": "string" }`

### Reports
- `GET /reports?type=daily|weekly|monthly|yearly` - Get sales report (protected)
- `GET /reports/summary` - Get summary statistics (protected)

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error