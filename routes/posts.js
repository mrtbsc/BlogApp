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
        req.flash('error', msg );

        let redirectUrl = ''
        if (req.method === 'PUT') {
            // We make the error appear in the same page it came from
            redirectUrl = req.originalUrl.split('?',1)[0]; // the originalUrl ends inconviniently with ..?method=PUT       
        }
        if (req.method === 'POST') {
            redirectUrl = '/';
        }
        res.redirect(redirectUrl);

    } else {
        next();
    }
}


/*** READ ROUTES ***/
    router.get('/', catchAsync( async (req, res) => {
        const posts = await Post.find().
        populate('category', 'name').
        populate('author', 'username');

        res.render('posts/index', { posts });
    }))

    router.get('/:id', catchAsync( async (req, res) => {
        const post = await Post.findById(req.params.id).
        populate('category').
        populate('author', 'username');
        const categories = await Category.find({}, 'name');
        if (!post) {
            req.flash('error', 'Cannot find that post!');
            return res.redirect('/posts');
        }
        res.render('posts/show', { post, categories } );
    }))
/**/

/*** WRITE ROUTES ***/
    router.post('/', validatePost , catchAsync( async (req, res) => {
        const p = new Post(req.body.post);
        p.date = new Date();
        const author = await User.findOne( { username: "Paula Colomé"} );
        p.author = author;
        await p.save();

        const category = await Category.findById(p.category._id);
        category.posts.push(p);
        category.save();

        author.posts.push(p);
        author.save();

        req.flash('success', 'Successfully created post')
        res.redirect("/");
    }))

    router.put('/:id', validatePost , catchAsync( async (req, res) => {
        const { id } = req.params;      
        const oldPost = await Post.findByIdAndUpdate(id, { ...req.body.post } );
        
        const oldCategoryId = oldPost.category._id; // IdObject type
        const newCategoryId = req.body.post.category; // String 
        if (!oldCategoryId.equals(newCategoryId)) {
            await Category.findByIdAndUpdate(oldCategoryId, { $pull: { posts: id } });
            await Category.findByIdAndUpdate(newCategoryId, { $push: { posts: id } });            
        }
        
        req.flash('success', 'Successfully updated post')
        res.redirect(`/posts/${id}`);

        
        
    }))

    router.delete('/:id', catchAsync( async (req, res) => {
        const { id } = req.params;
        const { category , author } = await Post.findByIdAndDelete(id).
            populate('category').
            populate('author');
        await Category.findByIdAndUpdate(category, { $pull: { posts: id } });
        await User.findByIdAndUpdate(author, { $pull: { posts: id } });
        
        req.flash('success', 'Successfully deleted post')
        res.redirect('/');
    }))
/**/

module.exports = router;