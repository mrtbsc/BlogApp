const express = require('express');
const router = express.Router();

const Post = require('../models/posts');
const Category = require('../models/categories');
const User = require('../models/users');

/*** READ ROUTES ***/
router.get('/', async (req, res) => {
    const users = await User.find();
    res.render('users/index', { users });
})

router.get('/profile', async (req, res) => {
    const user = await User.findOne( { name: "Paula Colomé"} );
    let isOwnProfile = true;
    res.render('users/edit', { user , isOwnProfile });
})

router.get('/:id/edit', async (req, res) => {
    const user = await User.findById( req.params.id );
    let isOwnProfile = false;
    res.render('users/edit', { user , isOwnProfile });
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).
    populate({path: 'posts', populate: 'category'});
        
    const posts = user.posts;
    res.render('users/show', { user , posts });
})
/**/

/*** WRITE ROUTES ***/
router.post('/', async (req, res) => {
    const user = new User({...req.body});
    await user.save();

    res.redirect('/users');
})

router.delete('/:id', async (req, res) => {
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
})

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const newInfo = req.body.user;
    const user = await User.findByIdAndUpdate(id, newInfo);

    res.redirect(`/users/${id}/edit`); 
})
/**/

module.exports = router;