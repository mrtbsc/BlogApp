const express = require('express');
const router = express.Router();

const Post = require('../models/posts');
const Category = require('../models/categories');
const User = require('../models/users');

/** READ ROUTES **/
    router.get('/', async (req, res) => {
        const categories = await Category.find();
        res.render('categories/index', { categories });
    })

    router.get('/:id', async (req, res) => {
        const category = await Category.findById(req.params.id).
        populate({path: 'posts', populate: 'author'});   
        const posts = category.posts;

        res.render('categories/show', { category , posts });
    })
/**/

/**  WRITE ROUTES **/
    router.post('/', async (req, res) => {
        const category = new Category({...req.body});
        category.dateCreated = new Date();
        await category.save();

        res.redirect('/');
        
    })

    router.delete('/:id', async (req, res) => {
        const category = await Category.findByIdAndDelete(req.params.id).
        populate({path: 'posts', populate: 'author'});
        try { 
            for (post of category.posts) {
                    await User.findByIdAndUpdate(post.author, { $pull: { posts: post.id } });
                    await Post.findByIdAndDelete(post.id);
                }
        } catch (e) {
            throw e;
        }
        
        res.redirect('/categories');
    })



    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        await Category.findByIdAndUpdate(id, { ...req.body });
        res.redirect(`/categories/${id}`); 
    })
/**/

module.exports = router;