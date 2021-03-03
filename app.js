/** RESTful CRUD approach

Resource post:

 GET   /                   Dashboard           index.html
 GET   /posts              view all posts      posts.html                           read ...
 POST  /posts              create a post       (accesible from posts.html)          create
 GET   /posts/:id/         show & edit form    details.html -> x.ejs ?              read ...
 POST  /posts/:id/         edits a post        (accesible from details.html)        update
 DELETE /posts/:id/        deletes a post      (accesible from details.html)        delete

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

mongoose.connect('mongodb://localhost:27017/blogApp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

app.get('/', async (req, res) => {
    const posts = await Post.find();
    res.render('dashboard', {posts});
})

app.get('/posts', async (req, res) => {
    const posts = await Post.find();
    res.render('posts/index', {posts});
})

app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})