const express = require('express');
const router = express.Router();
const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { newUserJoiSchema, editedUserJoiSchema } = require('../joiSchemas');
const { isLoggedIn } = require('../middleware');
const Post = require('../models/posts');
const Category = require('../models/categories');
const User = require('../models/users');

const validateUser = (req, res, next) => {
    let schema = null;
    let redirectUrl = '';
    if (req.method === 'PUT') {
        schema = editedUserJoiSchema;
        // We make the error appear in the same page it came from
        redirectUrl = req.originalUrl.split('?',1)[0] + 'edit'; // the originalUrl ends inconviniently with ..?method=PUT       
    }
    if (req.method === 'POST') {
        schema = newUserJoiSchema;
        redirectUrl = '/';
    }
    const { error } = schema.validate(req.body);
    
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        req.flash('error', msg );

        res.redirect(redirectUrl);
    } else {
        next();
    }
}



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
    res.redirect(redirectUrl);
})

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/');
})

/*** OTHER READ ROUTES ***/
router.get('/', catchAsync( async (req, res) => {
    const users = await User.find();
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