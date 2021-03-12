const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { categoryJoiSchema } = require('../joiSchemas');
const Post = require('../models/posts');
const Category = require('../models/categories');
const User = require('../models/users');

const validateCategory = (req, res, next) => {
    const { error } = categoryJoiSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

/** READ ROUTES **/
    router.get('/', catchAsync( async (req, res) => {
        const categories = await Category.find();
        res.render('categories/index', { categories });
    }))

    router.get('/:id', catchAsync( async (req, res) => {
        const category = await Category.findById(req.params.id).
        populate({path: 'posts', populate: 'author'});   
        const posts = category.posts;

        res.render('categories/show', { category , posts });
    }))
/**/

/**  WRITE ROUTES **/
    router.post('/', validateCategory, catchAsync( async (req, res) => {
        const category = new Category( req.body.category );
        category.dateCreated = new Date();
        await category.save();

        res.redirect('/');
        
    }))

    router.delete('/:id', catchAsync( async (req, res) => {
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
    }))



    router.put('/:id', validateCategory, catchAsync( async (req, res) => {
        const { id } = req.params;
        await Category.findByIdAndUpdate(id, {...req.body.category} );
        res.redirect(`/categories/${id}`); 
    }))
/**/

module.exports = router;