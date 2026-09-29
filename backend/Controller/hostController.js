const Home = require('../models/homeModel');
const Booking = require('../models/bookingModel');
const mongoose = require('mongoose');
function processAndUploadImage(buffer, originalname, mimetype) {
    // Upload directly to GridFS (Multer already enforces the 50KB limit and mimetype)
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'propertyImages'
    });
    
    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(originalname, {
            contentType: mimetype
        });
        
        uploadStream.on('error', reject);
        uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
        
        uploadStream.end(buffer);
    });
}

/* HOST STATS API */
exports.getHostStats = async (req, res, next) => {
    try {
        const hostId = req.session.user._id;

        const [homes, bookings] = await Promise.all([
            Home.find({ hostId }),
            Booking.find({ hostId })
        ]);

        const upcoming = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING');
        const revenue = bookings
            .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
            .reduce((acc, curr) => acc + curr.totalPrice, 0);

        res.json({
            stats: {
                totalProperties: homes.length,
                activeProperties: homes.filter(h => h.status === 'ACTIVE').length,
                upcomingReservations: upcoming.length,
                totalReservations: bookings.length,
                totalRevenue: revenue
            }
        });
    } catch (err) {
        console.error("Stats API Error", err);
        res.status(500).json({ error: 'Failed to fetch host stats.' });
    }
};

/* ADD HOME INFO (For initial form render checking) */
exports.getAddHome = (req, res, next) => {
    res.json({ editing: false, message: 'Ready to accept new home.' });
};

/* EDIT HOME PAGE INFO */
exports.getEditHome = (req, res, next) => {
    const homeId = req.params.homeId;

    Home.findOne({ _id: homeId, hostId: req.session.user._id })
        .then(home => {
            if (!home) {
                return res.status(404).json({ error: 'Home not found or access denied.' });
            }
            res.json({ home });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Failed to fetch home details.' });
        });
};

/* HOST HOME LIST */
exports.getHostHomeList = (req, res, next) => {
    Home.find({ hostId: req.session.user._id })
        .then(homes => {
            res.json({ homes });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Failed to fetch host homes.' });
        });
};

/* ADD HOME (POST) */
exports.postAddHome = async (req, res, next) => {
    try {
        const { 
            houseName, description, propertyType, 
            location, address, city, state, country,
            price, cleaningFee, 
            maxGuests, bedrooms, beds, bathrooms, rating 
        } = req.body;

        let amenities = [];
        if (req.body.amenities) {
            if (Array.isArray(req.body.amenities)) amenities = req.body.amenities;
            else amenities = req.body.amenities.split(',').map(a => a.trim());
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'At least one image file is required.' });
        }
        if (req.files.length > 5) {
            return res.status(400).json({ error: 'Maximum 5 images allowed.' });
        }

        let images = [];
        try {
            for (const file of req.files) {
                const gridFsId = await processAndUploadImage(file.buffer, file.originalname, file.mimetype);
                images.push(gridFsId);
            }
        } catch (err) {
            // Cleanup partial uploads
            const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'propertyImages' });
            for (const id of images) {
                try { await bucket.delete(new mongoose.Types.ObjectId(id)); } catch(e) {}
            }
            return res.status(400).json({ error: err.message });
        }

        const imageUrl = images[0]; // fallback primary image

        const home = new Home({
            houseName, description, propertyType,
            location, address, city, state, country,
            price, cleaningFee,
            maxGuests, bedrooms, beds, bathrooms, rating,
            amenities, images, imageUrl,
            hostId: req.session.user._id
        });

        const savedHome = await home.save();
        res.status(201).json({ success: true, message: 'Home added successfully.', home: savedHome });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to add home.' });
    }
};


/* EDIT HOME (POST) */
exports.postEditHome = async (req, res, next) => {
    try {
        const { 
            _id, houseName, description, propertyType, 
            location, address, city, state, country,
            price, cleaningFee, 
            maxGuests, bedrooms, beds, bathrooms, rating 
        } = req.body;

        let amenities = [];
        if (req.body.amenities) {
            if (Array.isArray(req.body.amenities)) amenities = req.body.amenities;
            else amenities = req.body.amenities.split(',').map(a => a.trim());
        }

        const home = await Home.findOne({ _id: _id, hostId: req.session.user._id });
        if (!home) return res.status(404).json({ error: 'Home not found.' });

        home.houseName = houseName;
        home.description = description;
        home.propertyType = propertyType;
        home.location = location;
        home.address = address;
        home.city = city;
        home.state = state;
        home.country = country;
        home.price = price;
        home.cleaningFee = cleaningFee;
        home.maxGuests = maxGuests;
        home.bedrooms = bedrooms;
        home.beds = beds;
        home.bathrooms = bathrooms;
        home.rating = rating;
        home.amenities = amenities;

        // Update images only if new ones are uploaded
        if (req.files && req.files.length > 0) {
            if (req.files.length > 5) {
                return res.status(400).json({ error: 'Maximum 5 images allowed.' });
            }

            let newImages = [];
            try {
                for (const file of req.files) {
                    const gridFsId = await processAndUploadImage(file.buffer, file.originalname);
                    newImages.push(gridFsId);
                }
            } catch (err) {
                const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'propertyImages' });
                for (const id of newImages) {
                    try { await bucket.delete(new mongoose.Types.ObjectId(id)); } catch(e) {}
                }
                return res.status(400).json({ error: err.message });
            }

            const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'propertyImages' });
            for (const oldId of home.images) {
                try { await bucket.delete(new mongoose.Types.ObjectId(oldId)); } catch(e) {}
            }

            home.images = newImages;
            home.imageUrl = newImages[0];
        }

        const updatedHome = await home.save();
        res.json({ success: true, message: 'Home updated successfully.', home: updatedHome });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to update home.' });
    }
};


/* TOGGLE HOME STATUS (SOFT DELETE / RESTORE) */
exports.postDeleteHome = async (req, res, next) => {
    try {
        const homeId = req.params.homeId;
        const home = await Home.findOne({ _id: homeId, hostId: req.session.user._id });
        
        if (!home) {
            return res.status(404).json({ error: 'Home not found or access denied.' });
        }
        
        home.status = home.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
        await home.save();
        
        res.json({ success: true, message: `Home ${home.status.toLowerCase()} successfully.` });
    } catch (err) {
        console.log('Error while toggling home status:', err);
        res.status(500).json({ error: 'Failed to toggle home status.' });
    }
};
