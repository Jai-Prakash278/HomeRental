const express = require('express');
const hostRouter = express.Router();
const homesController = require('../Controller/hostController');
const upload = require('../middleware/fileUpload');

hostRouter.get('/stats', homesController.getHostStats);

hostRouter.get('/addHome', homesController.getAddHome);
hostRouter.get('/hostHome-list', homesController.getHostHomeList);
hostRouter.post('/addHome', upload.array('images', 5), homesController.postAddHome);
hostRouter.get('/edit-home/:homeId', homesController.getEditHome);
hostRouter.post('/edit-home', upload.array('images', 5), homesController.postEditHome);
hostRouter.post('/delete-home/:homeId', homesController.postDeleteHome);

module.exports = hostRouter;