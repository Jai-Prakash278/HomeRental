const express = require('express');

const authRouter = express.Router();
const authController = require("../Controller/authController");

authRouter.get('/login', authController.getLogin);
authRouter.post('/login', authController.postLogin);
authRouter.post('/logout', authController.postLogout);
authRouter.get('/signup', authController.getSignUp);
authRouter.post('/signup', authController.postSignUp);
authRouter.post('/forgot-password', authController.postForgotPassword);
authRouter.post('/reset-password', authController.postResetPassword);
module.exports = authRouter;