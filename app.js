const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const { get } = require('http');
const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local');

const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/AppError');
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

/**************** EXTERNAL MIDDLEWARE ****************/


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());    
passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    res.locals.isAdmin = req.session.isAdmin;
    // console.log( 'before use', res.locals.snippets);
    // if (!res.locals.snippets) {
    //     res.locals.snippets = ""
    // } ;
    // console.log( 'from use', res.locals.snippets);
    next();
})

/**************** GENERAL MIDDLEWARE ****************/

app.get('*', (req, res, next) => {

    if (req.originalUrl !== '/users/login' 
            && req.originalUrl !== '/users/logout'
            && req.originalUrl !== '/users/register'){
        req.session.returnTo = req.originalUrl;
    }
    console.log(req.originalUrl);
    next();

})

/**************** ROUTES ****************/
app.use('/posts', postsRoutes);           
app.use('/categories', catRoutes);
app.use('/users', usersRoutes)

app.get('/', catchAsync( async (req, res) => {
    const posts = await Post.find().
    populate('category', 'name').
    populate('author', 'username');
    const categories = await Category.find({}, 'name');
    const usersCount = await User.countDocuments();
    
    res.render('dashboard', { posts, categories, usersCount });
}))

app.all( '*', (req, res, next) => {
    next( new AppError('Page not found', 404) );
})

/**************** ERROR HANDLER ****************/
app.use( (err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'D: Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

/**************** SERVER START ****************/
app.listen(3000, () => {
    console.log('Serving app on localhost:3000')
})