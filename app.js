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

app.get('/', async (req, res) => {
    const posts = await Post.find();
    res.render('dashboard', {posts});
})

app.get('/posts', async (req, res) => {
    const posts = await Post.find();
    res.render('posts/index', {posts});
})

app.get('/posts/:id', async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.render('posts/show', { post , categories } );
})

app.post('/posts', async (req, res) => {
    const p = new Post(req.body.post);
    p.date = new Date();
    await p.save();
    res.redirect("/");
})

app.put('/posts/:id', async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const p = await Post.findByIdAndUpdate(id, req.body.post );
    res.redirect(`/posts/${p._id}`);
})

app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const deletedPost = await Post.findByIdAndDelete(id);
    res.redirect('/posts');
})

app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})