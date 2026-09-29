const { check, validationResult } = require('express-validator');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_APP_PASSWORD
    }
});

exports.getLogin = (req, res) => {
    // Usually used to check current session state in REST APIs
    res.json({
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.user || null
    });
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(422).json({ error: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(422).json({ error: 'Invalid credentials.' });
        }

        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to initialize session.' });
            }

            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7; // Exactly 7 days from login
            
            req.session.save((err) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to save session.' });
                }
                res.json({ success: true, user, message: 'Logged in successfully.' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during login.' });
    }
};

exports.postLogout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid'); // ensure cookie is fully cleared
        res.json({ success: true, message: 'Logged out successfully.' });
    });
};

exports.getSignUp = (req, res) => {
    res.json({ message: "Sign up endpoint." });
};

exports.postSignUp = [

    check('fname')
        .trim()
        .isLength({ min: 2 })
        .withMessage('First Name must be at least 2 characters long')
        .matches(/^[A-Za-z]+$/)
        .withMessage('First Name must contain only letters'),

    check('lname')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Last Name must be at least 2 characters long')
        .matches(/^[A-Za-z]+$/)
        .withMessage('Last Name must contain only letters'),

    check('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),

    check('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&]/)
        .withMessage('Password must contain at least one special character'),

    check('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }
            return true;
        }),

    check('userType')
        .notEmpty()
        .withMessage('User type is required')
        .isIn(['guest', 'host'])
        .withMessage('Invalid user type'),

    check('term')
        .equals('on')
        .withMessage('You must accept the terms and conditions'),

    async (req, res) => {
        const errors = validationResult(req);
        const { fname, lname, email, password, userType } = req.body;

        if (!errors.isEmpty()) {
            return res.status(422).json({ 
                error: 'Validation failed', 
                details: errors.array().map(err => err.msg) 
            });
        }

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(422).json({ error: 'Email already exists.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ fname, lname, email, password: hashedPassword, userType });
            await user.save();
            
            // Send welcome email
            try {
                await transporter.sendMail({
                    to: email,
                    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
                    subject: 'Welcome to HomeRental!',
                    html: `
                        <div style="font-family: Arial, sans-serif; background-color: #f4f7f6; padding: 40px; margin: 0;">
                            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center;">
                                <h1 style="color: #4f46e5; margin-bottom: 20px; font-size: 32px;">HomeRental</h1>
                                <h2 style="color: #333333; font-size: 24px; margin-bottom: 15px;">Welcome to the community, ${fname}!</h2>
                                <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Your account has been successfully created. We're thrilled to have you here. You can now log in to start exploring beautiful properties or host your own!</p>
                                <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">Log In Now</a>
                                <p style="color: #999999; font-size: 14px; margin-top: 40px; border-top: 1px solid #eeeeee; padding-top: 20px;">If you didn't sign up for this account, please ignore this email.</p>
                            </div>
                        </div>
                    `
                });
            } catch (err) {
                console.error("Failed to send welcome email:", err);
            }
            
            res.status(201).json({ success: true, message: 'User created successfully.' });
        } catch (error) {
            res.status(500).json({ error: 'Server error during signup.' });
        }
    }
];

exports.postForgotPassword = (req, res) => {
    // Generate a 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const email = req.body.email;

    (async () => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ error: 'No account with that email found.' });
            }

            user.resetToken = otp;
            user.resetTokenExpiration = Date.now() + 600000; // 10 minutes
            await user.save();
            
            await transporter.sendMail({
                to: email,
                from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
                subject: 'HomeRental Password Reset OTP',
                html: `
                    <div style="font-family: Arial, sans-serif; background-color: #f4f7f6; padding: 40px; margin: 0;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center;">
                            <h1 style="color: #4f46e5; margin-bottom: 20px; font-size: 32px;">HomeRental</h1>
                            <h2 style="color: #333333; font-size: 24px; margin-bottom: 15px;">Password Reset Request</h2>
                            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">You recently requested to reset your password. Use the following One-Time Password (OTP) to proceed. This OTP is valid for exactly 10 minutes.</p>
                            <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                                <strong style="font-size: 36px; letter-spacing: 8px; color: #1e293b;">${otp}</strong>
                            </div>
                            <p style="color: #999999; font-size: 14px; margin-top: 40px; border-top: 1px solid #eeeeee; padding-top: 20px;">If you didn't request a password reset, you can safely ignore this email. Your account is secure.</p>
                        </div>
                    </div>
                `
            });
            
            res.json({ success: true, message: 'OTP has been sent to your email.' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to process request. Ensure SMTP is configured.' });
        }
    })();
};

exports.postResetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() } // token must be valid
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        
        await user.save();
        res.json({ success: true, message: 'Password has been successfully updated.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error during password reset.' });
    }
};
