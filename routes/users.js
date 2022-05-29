const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require('../controllers/users') // Controller

// Register
router.get('/register', users.renderRegisterForm)
router.post('/register', catchAsync(users.register))

// Verify email
router.post('/verify/:id/:token', users.verifyEmail)

// Login
router.get('/login', users.renderLoginForm)
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

// Logout
router.get('/logout', users.logout)


module.exports = router;