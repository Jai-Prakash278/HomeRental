const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    guestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    homeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Home',
        required: true
    },
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true,
        min: 1
    },
    numberOfNights: {
        type: Number,
        required: true,
        min: 1
    },
    pricePerNight: {
        type: Number,
        required: true,
        min: 0
    },
    cleaningFee: {
        type: Number,
        default: 0,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
        default: 'CONFIRMED'
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
