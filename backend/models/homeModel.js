const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({
    houseName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    propertyType: {
        type: String,
        enum: ['Entire home', 'Apartment', 'Private room', 'Shared room', 'Villa', 'Guest house', 'Other'],
        required: true,
        default: 'Entire home'
    },
    // Location Details
    location: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    
    // Pricing
    price: { type: Number, required: true }, // price per night
    cleaningFee: { type: Number, default: 0 },
    
    // Accommodation Details
    maxGuests: { type: Number, required: true, default: 1 },
    bedrooms: { type: Number, required: true, default: 1 },
    beds: { type: Number, required: true, default: 1 },
    bathrooms: { type: Number, required: true, default: 1 },
    
    amenities: [{ type: String }],
    
    // We keep imageUrl for backward compatibility or as the primary image, 
    // and add images[] for the gallery.
    imageUrl: String,
    images: [{ type: String }],
    
    rating: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },

    favouriteUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Home', homeSchema);
