# Bhavishya Aqua Feeds & Needs — Setup Instructions

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bhavishya-aqua
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   - Copy `backend/.env` and update MongoDB URI if needed
   - Default: `MONGO_URI=mongodb://localhost:27017/bhavishya_aqua`
   - For MongoDB Atlas, use your connection string

5. **Database Seeding**
   ```bash
   cd backend
   node seed.js
   ```
   This creates an admin user (username: `admin`, password: `admin123`) and sample products.

## Running the Application

1. **Start Backend**
   ```bash
   cd backend
   npm run dev  # For development with nodemon
   # or
   npm start    # For production
   ```
   Backend runs on `http://localhost:5000`

2. **Start Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm start
   ```
   Frontend runs on `http://localhost:3000`

## Access the Application

- Open `http://localhost:3000` in your browser
- Login with:
  - Username: `admin`
  - Password: `admin123`

## Production Deployment

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Serve Frontend** (using nginx, Apache, or similar)

3. **Environment Variables**
   - Set `NODE_ENV=production`
   - Update `MONGO_URI` for production database
   - Set strong `JWT_SECRET`

4. **Start Backend**
   ```bash
   cd backend
   npm start
   ```

## Features Overview

- **Authentication**: JWT-based secure login
- **Dashboard**: Overview of business metrics
- **Sale Module**: Create sales, manage customers, update stock
- **Return Module**: Process returns, restore stock
- **History**: View customer transaction history
- **Stock Management**: Monitor and update inventory
- **Reports**: Generate sales reports with charts
- **Search**: Find customers and their purchase history

## Troubleshooting

- Ensure MongoDB is running if using local instance
- Check console for any error messages
- Verify all dependencies are installed
- Confirm environment variables are set correctly