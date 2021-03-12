const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { userJoiSchema } = require('../joiSchemas');
const Post = require('../models/posts');
const Category = require('../models/categories');
const User = require('../models/users');

const validateUser = (req, res, next) => {
    const { error } = userJoiSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

/*** READ ROUTES ***/
router.get('/', catchAsync( async (req, res) => {
    const users = await User.find();
    res.render('users/index', { users });
}))

router.get('/profile', catchAsync( async (req, res) => {
    const user = await User.findOne('sd', { name: "Paula Colomé"} );
    let isOwnProfile = true;
    res.render('users/edit', { user , isOwnProfile });
}))

// // Tests for error objects
// router.use((err, req, res, next) => {
//     console.log('error stuff', res.statusCode, err.name);
//     console.dir(err);
//     next(err);
// })

router.get('/:id/edit', catchAsync( async (req, res) => {
    const user = await User.findById( req.params.id );
    let isOwnProfile = false;
    res.render('users/edit', { user , isOwnProfile });
}))

router.get('/:id', catchAsync( async (req, res) => {
    const user = await User.findById(req.params.id).
    populate({path: 'posts', populate: 'category'});
        
    const posts = user.posts;
    res.render('users/show', { user , posts });
}))
/**/

/*** WRITE ROUTES ***/
router.post('/', validateUser, catchAsync( async (req, res) => {
    const user = new User(req.body.user);
    await user.save();

    res.redirect('/users');
}))

router.delete('/:id', catchAsync( async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id).
    populate({path: 'posts', populate: 'category'});
    try { 
        for (post of user.posts) {
                await Category.findByIdAndUpdate(post.category, { $pull: { posts: post.id } });
                await Post.findByIdAndDelete(post.id);
            }
    } catch (e) {
        throw e;
    }
    
    res.redirect('/users');
}))

router.put('/:id', validateUser, catchAsync( async (req, res) => {
    const { id } = req.params;
    const newInfo = req.body.user;
    const user = await User.findByIdAndUpdate(id, newInfo);

    res.redirect(`/users/${id}/edit`); 
}))
/**/

module.exports = router;