const express = require('express');
const bookingRouter = express.Router();
const bookingController = require('../Controller/bookingController');

// All booking routes require authentication. This should be handled in app.js
bookingRouter.post('/', bookingController.postCreateBooking);
bookingRouter.get('/', bookingController.getGuestBookings);
bookingRouter.get('/host', bookingController.getHostBookings);
bookingRouter.patch('/:id/cancel', bookingController.patchCancelBooking);
bookingRouter.patch('/:id/checkout', bookingController.patchCheckoutBooking);

module.exports = bookingRouter;
