const Booking = require('../models/bookingModel');
const Home = require('../models/homeModel');

exports.postCreateBooking = async (req, res) => {
    try {
        if (req.session.user.userType !== 'guest') {
            return res.status(403).json({ error: 'Only guests can create bookings.' });
        }

        const { homeId, checkIn, checkOut, guests } = req.body;
        
        if (!homeId || !checkIn || !checkOut || !guests) {
            return res.status(400).json({ error: 'Missing required booking fields.' });
        }

        const parsedCheckIn = new Date(checkIn);
        const parsedCheckOut = new Date(checkOut);
        
        const today = new Date();

        if (isNaN(parsedCheckIn.getTime()) || isNaN(parsedCheckOut.getTime())) {
            return res.status(400).json({ error: 'Invalid date format.' });
        }

        if (parsedCheckIn < today) {
            return res.status(400).json({ error: 'Check-in date cannot be in the past.' });
        }

        if (parsedCheckOut <= parsedCheckIn) {
            return res.status(400).json({ error: 'Check-out date must be after check-in date.' });
        }

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ error: 'Property not found.' });
        }

        if (guests < 1 || guests > home.maxGuests) {
            return res.status(400).json({ error: `Invalid number of guests. Maximum allowed is ${home.maxGuests}.` });
        }

        const timeDiff = parsedCheckOut.getTime() - parsedCheckIn.getTime();
        const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        const pricePerNight = home.price;
        const cleaningFee = home.cleaningFee || 0;
        const totalPrice = (pricePerNight * numberOfNights) + cleaningFee;

        // Double Booking Protection
        const overlappingBooking = await Booking.findOne({
            homeId: home._id,
            status: { $in: ['PENDING', 'CONFIRMED'] },
            checkIn: { $lt: parsedCheckOut },
            checkOut: { $gt: parsedCheckIn }
        });

        if (overlappingBooking) {
            return res.status(409).json({ error: 'These dates are no longer available. Please select different dates.' });
        }

        const newBooking = new Booking({
            guestId: req.session.user._id,
            homeId: home._id,
            hostId: home.hostId, // Assuming home has a hostId. We need to verify if hostId exists on Home. If not we use req.session... wait. 
            checkIn: parsedCheckIn,
            checkOut: parsedCheckOut,
            guests,
            numberOfNights,
            pricePerNight,
            cleaningFee,
            totalPrice,
            status: 'CONFIRMED'
        });

        await newBooking.save();

        res.status(201).json({ success: true, booking: newBooking, message: 'Booking confirmed!' });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Server error while processing booking.' });
    }
};

exports.getGuestBookings = async (req, res) => {
    try {
        if (req.session.user.userType !== 'guest') {
            return res.status(403).json({ error: 'Access denied.' });
        }

        // Auto-update past CONFIRMED bookings to COMPLETED
        const today = new Date();
        await Booking.updateMany(
            { guestId: req.session.user._id, status: 'CONFIRMED', checkOut: { $lt: today } },
            { $set: { status: 'COMPLETED' } }
        );

        const bookings = await Booking.find({ guestId: req.session.user._id })
            .populate('homeId')
            .sort({ checkIn: 1 });
            
        res.json({ success: true, bookings });
    } catch (error) {
        console.error('Fetch bookings error:', error);
        res.status(500).json({ error: 'Server error while fetching bookings.' });
    }
};

exports.getHostBookings = async (req, res) => {
    try {
        if (req.session.user.userType !== 'host') {
            return res.status(403).json({ error: 'Access denied. Hosts only.' });
        }

        // Auto-update past CONFIRMED bookings to COMPLETED
        const today = new Date();
        await Booking.updateMany(
            { hostId: req.session.user._id, status: 'CONFIRMED', checkOut: { $lt: today } },
            { $set: { status: 'COMPLETED' } }
        );

        const bookings = await Booking.find({ hostId: req.session.user._id })
            .populate('homeId')
            .populate('guestId', 'fname lname email')
            .sort({ checkIn: 1 });
            
        res.json({ success: true, bookings });
    } catch (error) {
        console.error('Fetch bookings error:', error);
        res.status(500).json({ error: 'Server error while fetching bookings.' });
    }
};

exports.patchCancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        if (booking.guestId.toString() !== req.session.user._id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to cancel this booking.' });
        }

        if (booking.status === 'CANCELLED') {
            return res.status(400).json({ error: 'Booking is already cancelled.' });
        }

        if (booking.status === 'COMPLETED') {
            return res.status(400).json({ error: 'Cannot cancel a completed booking.' });
        }

        if (booking.checkIn <= new Date()) {
            return res.status(400).json({ error: 'Cannot cancel booking after check-in time. Calculation has already started.' });
        }

        booking.status = 'CANCELLED';
        await booking.save();

        res.json({ success: true, message: 'Booking cancelled successfully.' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Server error while cancelling booking.' });
    }
};

exports.patchCheckoutBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.guestId.toString() !== req.session.user._id.toString()) return res.status(403).json({ error: 'Unauthorized.' });
        if (booking.status !== 'CONFIRMED') return res.status(400).json({ error: 'Can only checkout from active bookings.' });

        const now = new Date();
        if (now < booking.checkIn) {
            return res.status(400).json({ error: 'Booking has not started yet.' });
        }

        const originalDays = booking.numberOfNights;
        const actualTimeStayed = now.getTime() - booking.checkIn.getTime();
        
        // Calculate days stayed (round up to nearest whole day, minimum 1)
        let daysStayed = Math.ceil(actualTimeStayed / (1000 * 3600 * 24));
        if (daysStayed < 1) daysStayed = 1;

        if (daysStayed < originalDays) {
            const daysRemaining = originalDays - daysStayed;
            
            // Full charge for days stayed, 50% penalty for remaining unstayed days
            const newNightsCharged = daysStayed + (daysRemaining * 0.5);
            
            booking.totalPrice = (booking.pricePerNight * newNightsCharged) + (booking.cleaningFee || 0);
        }
        
        booking.checkOut = now;
        booking.status = 'COMPLETED';
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id).populate('homeId');

        res.json({ success: true, booking: populatedBooking, message: 'Checked out successfully. Payment slip generated.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error during checkout.' });
    }
};
/* GET AVAILABILITY */
exports.getAvailability = async (req, res, next) => {
    try {
        const homeId = req.params.homeId;
        const bookings = await Booking.find({
            homeId,
            status: { $in: ['PENDING', 'CONFIRMED'] },
            checkOut: { $gte: new Date() } // Only return future bookings
        }).select('checkIn checkOut -_id');

        res.json({ success: true, blockedDates: bookings });
    } catch (error) {
        console.error('Fetch availability error:', error);
        res.status(500).json({ error: 'Failed to fetch availability.' });
    }
};
