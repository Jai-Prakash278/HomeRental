const express = require('express');

const storeRouter = express.Router();
// const { homes } = require('./hostRouter');
const storeController = require("../Controller/storeController");

storeRouter.get('/', storeController.getIndex);
storeRouter.get('/home-list', storeController.getHome);
storeRouter.get('/favourite-list', storeController.getFavourite);
storeRouter.post('/favourite-list', storeController.postAddToFavourite);
storeRouter.post('/remove-favourite', storeController.postRemoveFavourite);
storeRouter.get('/bookings', storeController.getBookings);
const bookingController = require("../Controller/bookingController");

storeRouter.get('/rules/:homeId', storeController.getHouseRules);
storeRouter.get('/reviews/:homeId', storeController.getReviews);
storeRouter.post('/reviews', storeController.postAddReview);
storeRouter.get('/availability/:homeId', bookingController.getAvailability);
storeRouter.get('/images/:fileId', storeController.getGridFSImage);

storeRouter.get('/:homeId', storeController.getHomeDetails);

module.exports = storeRouter;