const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fname: {
        type: String,
        required: [true, 'First Name is required'],
    },
    lname: {
        type: String,
        required: [true, 'Last Name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    userType: {
        type: String,
        enum: ['guest', 'host'],
        required: [true, 'User type is required'],
    },
    favourites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Home'
    }],
    resetToken: String,
    resetTokenExpiration: Date
})

module.exports = mongoose.model('User', userSchema)