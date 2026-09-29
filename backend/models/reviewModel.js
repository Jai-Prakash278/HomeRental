const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
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
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true // 1 review per booking
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
