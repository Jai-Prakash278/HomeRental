//Core Modules
require('dotenv').config();
const path = require('path');
const rootDir = require('./utils/pathUtils');

//External Modules
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);
const mongoUrl = process.env.MONGO_URI;

//Internal Modules
const hostRouter = require('./Routes/hostRouter');
const storeRouter = require('./Routes/storeRouter');
const authRouter = require('./Routes/authRouter');
const { notFound } = require("./Controller/notFoundController");

const app = express();

// Required for secure cookies behind reverse proxies (like Render)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

const sessionStore = new mongoDBStore({
    uri: mongoUrl,
    collection: 'sessions'
})


const cors = require('cors');
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:5173', 
            process.env.FRONTEND_URL
        ];
        
        // Allow Vercel preview/production domains dynamically
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS blocked origin: ' + origin));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/host/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/store/uploads', express.static(path.join(rootDir, 'uploads')));
app.use(express.static(path.join(rootDir, 'public')));



app.use(session({
    secret: process.env.SESSION_SECRET || "Fallback Secret",
    resave: false,
    saveUninitialized: false, // Don't save empty sessions
    store: sessionStore,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' requires secure: true
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}))

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.user = req.session.user || null;
    req.isLoggedIn = req.session.isLoggedIn || false;
    next();
});


app.use('/api/store', storeRouter);
const isHost = require('./middleware/isHost');

const bookingRouter = require('./Routes/bookingRouter');

app.use("/api/host", (req, res, next) => {
    if (req.isLoggedIn) {
        next();
    } else {
        res.status(401).json({ error: "Not authenticated" });
    }
}, isHost);
app.use("/api/host", hostRouter);
app.use("/api/auth", authRouter);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Bookings
app.use("/api/bookings", (req, res, next) => {
    if (!req.isLoggedIn || !req.session.user) {
        return res.status(401).json({ error: "Not authenticated to view or create bookings" });
    }
    next();
}, bookingRouter);

// Global Error Handler for Multer
app.use((err, req, res, next) => {
    if (err && err.name === 'MulterError') {
        return res.status(400).json({ error: `Image upload failed: ${err.message}. Ensure every image is strictly under 50KB and maximum 5 files.` });
    }
    next(err);
});

app.use(notFound);

const PORT = process.env.PORT || 4800;

mongoose.connect(mongoUrl)
    .then(() => {
        console.log("Connected to MongoDB successfully.");
        // Listen on 0.0.0.0 for Render port detection compatibility
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running at port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to connect to MongoDB. Server not started.", err);
        process.exit(1);
    });