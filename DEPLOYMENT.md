# Deployment Guide for HomeRental MVP

This guide outlines the steps necessary to deploy the HomeRental MVP to a staging or production environment.

## Prerequisites
- A MongoDB Atlas account (or equivalent cloud MongoDB provider)
- A Node.js PaaS provider (e.g., Render, Heroku, Railway, AWS Elastic Beanstalk)
- A Static Site Host (e.g., Vercel, Netlify)

## 1. Database Setup
1. Create a cluster on MongoDB Atlas.
2. In Network Access, whitelist the IP addresses of your backend deployment server (or `0.0.0.0/0` if necessary, though restricted is better).
3. Create a Database User with a strong password.
4. Copy the connection string. Replace `<password>` with your user's password. This is your `MONGO_URI`.

## 2. Backend Deployment
1. Connect your backend hosting provider to the repository's `backend/` directory.
2. Set the build command: `npm install`
3. Set the start command: `npm start`
4. Configure Environment Variables in the provider's dashboard:
   - `NODE_ENV=production`
   - `MONGO_URI=<Your Atlas Connection String>`
   - `SESSION_SECRET=<Generate a strong random 64-character string>`
   - `FRONTEND_URL=<The URL where your frontend will be deployed>`
   - `PORT=<Provider will usually inject this dynamically>`
5. Deploy and wait for the "Server is running" log.
6. Test the health check endpoint: `GET https://your-backend-url.com/health`

## 3. Frontend Deployment
1. Connect your frontend hosting provider to the repository's `frontend/` directory.
2. Set the build command: `npm run build`
3. Set the output directory: `dist`
4. Configure Environment Variables in the provider's dashboard:
   - `VITE_API_URL=<The URL of your deployed backend, e.g., https://your-backend-url.com>`
5. Deploy the frontend.

## 4. CORS and Cookies (Important!)
Because this application uses Express Sessions, `sameSite` is set to `none` (with `secure: true`) in production environments. This allows authentication to work when the frontend and backend are hosted on different domains.
- Ensure the `FRONTEND_URL` environment variable on the backend perfectly matches the frontend's deployed URL (no trailing slashes).
- Ensure the backend is served over HTTPS.

## 5. Troubleshooting
- **Cannot login / Session drops immediately:** Ensure your backend has `NODE_ENV=production` set. The cookie requires HTTPS. Also verify the `FRONTEND_URL` exactly matches the origin.
- **Image Uploads fail:** Make sure the deployment provider has a writable file system for the `uploads/` directory, or consider migrating storage to an S3 bucket in a future phase. The current implementation uses local disk storage and enforces a strict 5MB limit.
- **Database Connection Refused:** Verify your MongoDB Atlas Network Access IP whitelist.
