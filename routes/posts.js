const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { postJoiSchema } = require('../joiSchemas');
const Post = require('../models/posts');
const Category = require('../models/categories');
const User = require('../models/users');

const validatePost = (req, res, next) => {
    const { error } = postJoiSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}


/*** READ ROUTES ***/
    router.get('/', catchAsync( async (req, res) => {
        const posts = await Post.find().
        populate('category', 'name').
        populate('author', 'name');

        res.render('posts/index', { posts });
    }))

    router.get('/:id', catchAsync( async (req, res) => {
        const post = await Post.findById(req.params.id).
        populate('category').
        populate('author', 'name');
        const categories = await Category.find({}, 'name');

        res.render('posts/show', { post, categories } );
    }))
/**/

/*** WRITE ROUTES ***/
    router.post('/', validatePost , catchAsync( async (req, res) => {
        const p = new Post(req.body.post);
        p.date = new Date();
        const author = await User.findOne( { name: "Paula Colomé"} );
        p.author = author;
        await p.save();

        const category = await Category.findById(p.category._id);
        category.posts.push(p);
        category.save();

        author.posts.push(p);
        author.save();

        res.redirect("/");
    }))

    router.put('/:id', validatePost , catchAsync( async (req, res) => {
        const { id } = req.params;
        try {       
            const oldPost = await Post.findByIdAndUpdate(id, { ...req.body.post } );
            
            const oldCategoryId = oldPost.category._id; // IdObject type
            const newCategoryId = req.body.post.category; // String 
            if (!oldCategoryId.equals(newCategoryId)) {
                await Category.findByIdAndUpdate(oldCategoryId, { $pull: { posts: id } });
                await Category.findByIdAndUpdate(newCategoryId, { $push: { posts: id } });            
            }
            
            res.redirect(`/posts/${id}`);
        } catch (e) {
            throw e;
        }
        
        
    }))

    router.delete('/:id', catchAsync( async (req, res) => {
        const { id } = req.params;
        const { category , author } = await Post.findByIdAndDelete(id).
            populate('category').
            populate('author');
        await Category.findByIdAndUpdate(category, { $pull: { posts: id } });
        await User.findByIdAndUpdate(author, { $pull: { posts: id } });
        
        res.redirect('/');
    }))
/**/

module.exports = router;