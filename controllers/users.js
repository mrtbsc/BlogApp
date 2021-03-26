const Post = require('../models/posts');
const Category = require('../models/categories');
const User = require('../models/users');
const mongoose = require('mongoose');

/*** AUTHENTICATION FUNCTIONS ***/



module.exports.displayRegisterForm = (req, res) => {
    res.render('users/register');
}

module.exports.registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to the Blog!');
            res.redirect('/');
        })
      
    } 
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/users/register');
    }
}

module.exports.displayLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.displaySettings = (req, res) => {
    res.render('underConstruction');
}

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    if (req.user.username === "Admin") {
        req.session.isAdmin = true;
    }

    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    delete req.session.isAdmin;
    res.redirect(redirectUrl);
}

/*** OTHER READ FUNCTIONS ***/

module.exports.displayIndex = async (req, res) => {
    let query = {};
    if (req.user) {
        const currentUserId = req.user._id + "";
        query = { _id : { $ne:  mongoose.Types.ObjectId(currentUserId)}};
    } 
    const users = await User.find( query );
    res.render('users/index', { users });
}

module.exports.displayCurrentUser = async (req, res) => {
    const user = req.user;
    let isOwnProfile = true;
    res.render('users/edit', { user , isOwnProfile });
}

module.exports.displayUpdateForm = async (req, res) => {
    const user = await User.findById( req.params.id );

    if (!user) {
        req.flash('error', 'Cannot find that user!');
        return res.redirect('/users');
    }
    let isOwnProfile = false;
    res.render('users/edit', { user , isOwnProfile });
}

module.exports.displayUser = async (req, res) => {
    const user = await User.findById(req.params.id).
    populate({path: 'posts', populate: 'category'});
    const posts = user.posts;

    if (!user) {
        req.flash('error', 'Cannot find that user!');
        return res.redirect('/users');
    }
    res.render('users/show', { user , posts });
}


/*** OTHER WRITE FUNCTIONS ***/

module.exports.createUser = async (req, res, next) => {
    try {

        const { email, username, password } = req.body.user;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.flash('success', 'Successfully created user!');
        res.redirect('/users');
    
    } catch (e) {

        // res.locals.snippets = "<script> alert('aaa') </script>"; //$('#add-user-modal').css('display','block').addClass('show') 
        req.flash('error', e.message);
        res.redirect('/');
    }
}

module.exports.deleteUser = async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id).
    populate({path: 'posts', populate: 'category'});
    for (post of user.posts) {
            await Category.findByIdAndUpdate(post.category, { $pull: { posts: post.id } });
            await Post.findByIdAndDelete(post.id);
        }

    req.flash('success', 'Successfully deleted user!');     
    res.redirect('/users');
}

module.exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const newInfo = req.body.user;
    const user = await User.findByIdAndUpdate(id, newInfo);

    req.flash('success', 'Successfully updated user!'); 
    res.redirect(`/users/${id}/edit`); 
}