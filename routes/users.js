const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateUser } = require('../middleware');
const Post = require('../models/posts');
const Category = require('../models/categories');
const User = require('../models/users');

/*** AUTHENTICATION ROUTES ***/

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to the Blog!');
            res.redirect('/');
        })         
    } 
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/users/register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    if (req.user.username === "Admin") {
        console.log('llega');
        req.session.isAdmin = true;
        console.log(res.locals);
    }

    res.redirect(redirectUrl);
})

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    delete req.session.isAdmin;
    res.redirect(redirectUrl);
})

/*** OTHER READ ROUTES ***/
router.get('/', catchAsync( async (req, res) => {
    let query = {};
    if (req.user) {
        const currentUserId = req.user._id + "";
        query = { _id : { $ne:  mongoose.Types.ObjectId(currentUserId)}};
    } 
    console.log(query);
    const users = await User.find( query );
    res.render('users/index', { users });
}))

router.get('/profile', isLoggedIn, catchAsync( async (req, res) => {
    const user = req.user;
    let isOwnProfile = true;
    res.render('users/edit', { user , isOwnProfile });
}))

router.get('/:id/edit', catchAsync( async (req, res) => {
    const user = await User.findById( req.params.id );

    if (!user) {
        req.flash('error', 'Cannot find that user!');
        return res.redirect('/users');
    }
    let isOwnProfile = false;
    res.render('users/edit', { user , isOwnProfile });
}))

router.get('/:id', catchAsync( async (req, res) => {
    const user = await User.findById(req.params.id).
    populate({path: 'posts', populate: 'category'});
    const posts = user.posts;

    if (!user) {
        req.flash('error', 'Cannot find that user!');
        return res.redirect('/users');
    }
    res.render('users/show', { user , posts });
}))
/**/

/*** OTHER WRITE ROUTES ***/

router.post('/', validateUser, catchAsync( async (req, res, next) => {
    try {

        const { email, username, password } = req.body.user;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.flash('success', 'Successfully created user!');
        res.redirect('/users');
    
    } catch (e) {

        // res.locals.snippets = "<script> alert('aaa') </script>"; //$('#add-user-modal').css('display','block').addClass('show') 
        req.flash('error', e.message);
        res.redirect('/');
    }
}))

router.delete('/:id', catchAsync( async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id).
    populate({path: 'posts', populate: 'category'});
    for (post of user.posts) {
            await Category.findByIdAndUpdate(post.category, { $pull: { posts: post.id } });
            await Post.findByIdAndDelete(post.id);
        }

    req.flash('success', 'Successfully deleted user!');     
    res.redirect('/users');
}))

router.put('/:id', validateUser, catchAsync( async (req, res) => {
    const { id } = req.params;
    const newInfo = req.body.user;
    const user = await User.findByIdAndUpdate(id, newInfo);

    req.flash('success', 'Successfully updated user!'); 
    res.redirect(`/users/${id}/edit`); 
}))
/**/

module.exports = router;