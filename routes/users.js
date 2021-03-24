const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateUser } = require('../middleware');
const users = require('../controllers/users');


/*** AUTHENTICATION ROUTES ***/

router.route('/register')
    .get( users.displayRegisterForm )
    .post ( catchAsync( users.registerUser ))

router.route('/login')
    .get( users.displayLoginForm )
    .post( passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser )

router.get('/logout', isLoggedIn, users.logoutUser );

/*** OTHER ROUTES ***/

router.route('/')
    .get( catchAsync( users.displayIndex ))
    .post( validateUser, catchAsync( users.createUser ))

router.get('/profile', isLoggedIn, catchAsync( users.displayCurrentUser ))

router.route('/:id')
    .get( catchAsync( users.displayUser ) )
    .put( validateUser, catchAsync( users.updateUser ) )
    .delete( catchAsync( users.deleteUser ) )

router.get('/:id/edit', catchAsync( users.displayUpdateForm ))

module.exports = router;