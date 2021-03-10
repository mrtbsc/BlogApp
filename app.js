const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const { get } = require('http');

const Post = require('./models/posts');
const Category = require('./models/categories');
const User = require('./models/users');

const postsRoutes = require('./routes/posts');
const catRoutes = require('./routes/categories');
const usersRoutes = require('./routes/users');

/**************** CONNECT WITH THE DB ****************/
mongoose.connect('mongodb://localhost:27017/blogApp', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false 
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => { console.log("Database connected"); });

/**************** MORE SET UP ****************/
const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

/**************** ROUTES ****************/
app.use('/posts', postsRoutes);           
app.use('/categories', catRoutes);
app.use('/users', usersRoutes)

app.get('/', async (req, res) => {
    const posts = await Post.find().
    populate('category', 'name').
    populate('author', 'name');
    const categories = await Category.find({}, 'name');
    const usersCount = await User.countDocuments();
    
    res.render('dashboard', { posts, categories, usersCount });
})


/**************** SERVER START ****************/
app.listen(3000, () => {
    console.log('Serving app on localhost:3000')
})