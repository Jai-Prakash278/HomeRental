# HomeRental Marketplace MVP

A complete, responsive property rental marketplace application built with the MERN stack (MongoDB, Express, React, Node.js). 

## Features
- **Guest Experience**: Discover properties, filter and paginate search results, manage bookings, cancel trips, save favorites, and write reviews.
- **Host Experience**: List properties with multi-image uploads, toggle property status (activate/deactivate), monitor incoming reservations, and view real-time revenue statistics on a dedicated dashboard.
- **Booking Engine**: Reliable server-side availability validation and price calculation, preventing overlap and tampering.
- **Design System**: A sleek, modern "glassmorphism" aesthetic built with custom CSS for a premium feel.

## Tech Stack
**Frontend:**
- React 18
- Vite
- React Router v6
- Axios

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- Express Sessions (Cookie-based Auth)
- Multer (Image Uploads)

## Local Development

### 1. Database
Ensure you have MongoDB running locally or a MongoDB Atlas URI.

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory using `.env.example` as a template.
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend/` directory using `.env.example` as a template.
```bash
npm run dev
```

## Deployment
Please refer to the [DEPLOYMENT.md](./DEPLOYMENT.md) guide for comprehensive instructions on securely staging and deploying the application to production environments.
