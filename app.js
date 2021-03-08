/** RESTful CRUD approach

Resource post:

 GET    /                   Dashboard                dashboard.ejs
 GET    /posts              view all posts           index.ejs                            read ...
 POST   /posts              create a post            (accesible from dashboard.ejs )      create
 GET    /posts/:id/         view show-&-edit form    show.ejs                             read ...
 PUT    /posts/:id/         edit a post              (accesible from show.ejs)            update
 DELETE /posts/:id/         delete a post            (accesible from show.ejs)            delete

Other Resources and its relationships with posts:

Category    One category has many post. A post has only one category
            But we want to have easy access from a post to its category, and from a category to all the posts.
            Let's store the objectIds of the relaed resource in each collection

Users       One user has many posts. A post has only a user
            But we want to have easy access from a post to its category, and from a category to all the posts.
            Let's store the objectIds of the relaed resource in each collection

**/

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const { get } = require('http');

const Post = require('./models/posts');
const Category = require('./models/categories');
const { findByIdAndUpdate } = require('./models/posts');

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

mongoose.connect('mongodb://localhost:27017/blogApp', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

let categories = ["Web Development", "Tech Gadgets", "Business", "Health & Wellness"];

// READ ROUTES for POST RESOURCE

app.get('/', async (req, res) => {
    const posts = await Post.find().populate('category', 'name');
    console.log(posts);
    const categories = await Category.find({}, 'name');
    res.render('dashboard', { posts, categories});
})

app.get('/posts', async (req, res) => {
    const posts = await Post.find().populate('category', 'name');
    res.render('posts/index', {posts});
})

app.get('/posts/:id', async (req, res) => {
    const post = await Post.findById(req.params.id).populate('category');
    const categories = await Category.find({}, 'name');
    res.render('posts/show', { post, categories } );
})

// WRITE ROUTES for POST RESOURCE

app.post('/posts', async (req, res) => {
    const p = new Post(req.body.post);
    p.date = new Date();
    await p.save();
    const category = await Category.findById(p.category._id);
    console.log(category, p.category._id);
    category.posts.push(p);
    category.save();
    res.redirect("/");
})

app.put('/posts/:id', async (req, res) => {
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
    
    
})

app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const deletedPost = await Post.findByIdAndDelete(id).populate('category');
    const affectedCategory = deletedPost.category;
    affectedCategory.posts.pop(deletedPost);
    res.redirect('/');
})

// READ ROUTES for CATEGORIES RESOURCE

app.get('/categories', async (req, res) => {
    const categories = await Category.find();
    res.render('categories/index', { categories });
})

app.get('/categories/:id', async (req, res) => {
    const category = await Category.findById(req.params.id).populate('posts');
    const posts = category.posts;
    console.log(posts);
    res.render('categories/show', { category , posts });
})

//  WRITE ROUTES for CATEGORIES RESOURCE
app.post('/categories', async (req, res) => {
    console.dir(req.body.name);
    const category = new Category({...req.body});
    category.dateCreated = new Date();
    await category.save();
    res.redirect('/');
    
})

app.delete('/categories/:id', async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    console.dir(category);
    await Post.deleteMany({
        _id: {
            $in: category.posts
        }
    });
    res.redirect('/categories');

})

app.put('/categories/:id', async (req, res) => {
    const { id } = req.params;
    await Category.findByIdAndUpdate(id, { ...req.body });
    res.redirect(`/categories/${id}`); 
})

//
app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})