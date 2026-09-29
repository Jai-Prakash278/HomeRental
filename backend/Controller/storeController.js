const User = require('../models/userModel');
const Home = require('../models/homeModel');
const path = require('path');
const rootDir = require('../utils/pathUtils');
const mongoose = require('mongoose');

/* HOME PAGE (All available homes) - With Search & Filters */
exports.getIndex = async (req, res, next) => {
    try {
        const { location, guests, propertyType, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
        
        let query = { status: 'ACTIVE' }; // Only show active properties

        if (location) {
            query.$or = [
                { location: { $regex: location, $options: 'i' } },
                { city: { $regex: location, $options: 'i' } },
                { country: { $regex: location, $options: 'i' } }
            ];
        }
        
        if (propertyType) {
            query.propertyType = propertyType;
        }
        
        if (guests) {
            query.maxGuests = { $gte: parseInt(guests) };
        }
        
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseInt(minPrice);
            if (maxPrice) query.price.$lte = parseInt(maxPrice);
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const total = await Home.countDocuments(query);
        const homes = await Home.find(query).skip(skip).limit(limitNum);

        res.json({ 
            success: true, 
            homes,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (err) {
        console.log('Error while fetching homes:', err);
        res.status(500).json({ error: 'Failed to fetch homes.' });
    }
};

/* HOME LIST (Can be customized later for specific queries) */
exports.getHome = (req, res, next) => {
    Home.find()
        .then(homes => {
            res.json({ homes });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Failed to fetch homes.' });
        });
};

/* FAVOURITE LIST */
exports.getFavourite = async (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const userId = req.session.user._id;
        const favouriteHomes = await Home.find({
            favouriteUsers: userId,
            status: 'ACTIVE'
        });
        res.json({ favouriteHomes });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch favourite homes.' });
    }
};

/* ADD TO FAVOURITE */
exports.postAddToFavourite = async (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const homeId = req.body.id;
        const userId = req.session.user._id;

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ error: 'Home not found.' });
        }

        const alreadyFavourited = home.favouriteUsers.some(id => id.toString() === userId.toString());

        if (!alreadyFavourited) {
            home.favouriteUsers.push(userId);
            await home.save();
        }

        await User.findByIdAndUpdate(userId, {
            $addToSet: { favourites: homeId }
        });

        res.json({ success: true, message: 'Added to favourites.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to add to favourites.' });
    }
};

/* REMOVE FROM FAVOURITE */
exports.postRemoveFavourite = async (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const homeId = req.body._id;
        const userId = req.session.user._id;

        await Home.findByIdAndUpdate(homeId, {
            $pull: { favouriteUsers: userId }
        });

        await User.findByIdAndUpdate(userId, {
            $pull: { favourites: homeId }
        });

        res.json({ success: true, message: 'Removed from favourites.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to remove from favourites.' });
    }
};

/* BOOKINGS */
exports.getBookings = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    // TODO: Fetch real bookings when the model is implemented
    res.json({ bookings: [] });
};

/* HOME DETAILS */
exports.getHomeDetails = (req, res, next) => {
    const homeId = req.params.homeId;

    Home.findById(homeId)
        .then(home => {
            if (!home) {
                return res.status(404).json({ error: 'Home not found.' });
            }
            if (home.status === 'INACTIVE') {
                const userId = req.session.user ? req.session.user._id.toString() : null;
                const hostId = home.hostId.toString();
                if (userId !== hostId) {
                    return res.status(403).json({ error: 'This property is currently inactive and cannot be viewed.' });
                }
            }
            res.json({ home });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Failed to fetch home details.' });
        });
};

/* REVIEWS */
exports.getReviews = async (req, res, next) => {
    try {
        const homeId = req.params.homeId;
        const reviews = await require('../models/reviewModel').find({ homeId }).populate('guestId', 'fname lname').sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch reviews.' });
    }
};

exports.postAddReview = async (req, res, next) => {
    try {
        if (req.session.user.userType !== 'guest') return res.status(403).json({ error: 'Only guests can leave reviews.' });
        
        const { homeId, bookingId, rating, comment } = req.body;
        console.log("RECEIVED REVIEW BODY:", req.body);
        
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
        if (!comment || comment.trim().length === 0) return res.status(400).json({ error: 'Comment is required.' });

        const Booking = require('../models/bookingModel');
        const booking = await Booking.findById(bookingId);
        
        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.guestId.toString() !== req.session.user._id.toString()) return res.status(403).json({ error: 'Unauthorized.' });
        if (booking.status !== 'COMPLETED') return res.status(400).json({ error: 'Can only review completed stays.' });
        
        const Review = require('../models/reviewModel');
        const existing = await Review.findOne({ bookingId });
        if (existing) return res.status(400).json({ error: 'You have already reviewed this stay.' });

        const newReview = new Review({
            guestId: req.session.user._id,
            homeId,
            bookingId,
            rating,
            comment
        });

        await newReview.save();

        // Update Home rating
        const reviews = await Review.find({ homeId });
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Home.findByIdAndUpdate(homeId, { rating: avg.toFixed(1) });

        res.status(201).json({ success: true, message: 'Review added successfully!', review: newReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add review.' });
    }
};

/* DOWNLOAD HOUSE RULES */
exports.getHouseRules = [
    (req, res, next) => {
        if (!req.session.isLoggedIn) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        next();
    },
    (req, res, next) => {
        const rulesFilename = `House Rules.pdf`;
        const filePath = path.join(rootDir, 'rules', rulesFilename);
        res.download(filePath, 'Rules.pdf', (err) => {
            if (err) {
                res.status(404).json({ error: 'File not found.' });
            }
        });
    }
];

/* SERVE GRIDFS IMAGES */
exports.getGridFSImage = async (req, res, next) => {
    try {
        const fileId = req.params.fileId;
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ error: 'Invalid image ID.' });
        }

        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'propertyImages'
        });

        // Set cache control headers as images are public and relatively static
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day caching
        res.setHeader('Content-Type', 'image/webp');
        
        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

        downloadStream.on('error', (err) => {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'Image not found.' });
            }
            res.status(500).json({ error: 'Error serving image.' });
        });

        downloadStream.pipe(res);
    } catch (error) {
        console.error('GridFS streaming error:', error);
        res.status(500).json({ error: 'Failed to stream image.' });
    }
};