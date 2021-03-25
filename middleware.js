const tellIfAuthor = require('./utils/tellIfAuthor');
const Post = require('./models/posts');
const Category = require('./models/categories');
const User = require('./models/users');

const { postJoiSchema, categoryJoiSchema } = require('./joiSchemas');
const { newUserJoiSchema, editedUserJoiSchema } = require('./joiSchemas');


module.exports.isLoggedIn = (req, res, next) => {
    console.log('enters isLoggedIn')
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/users/login');
    }
    next();
}

module.exports.validatePost = (req, res, next) => {
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

module.exports.validateCategory = (req, res, next) => {
    const { error } = categoryJoiSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        req.flash('error', msg );

    } else {
        next();
    }
}

module.exports.validateUser = (req, res, next) => {
    let schema = null;
    let redirectUrl = '';
    console.log('method', req.method);
    if (req.method === 'PUT') {
        schema = editedUserJoiSchema;
        // We make the error appear in the same page it came from
        redirectUrl = req.originalUrl.split('?',1)[0] + 'edit'; // the originalUrl ends inconviniently with ..?method=PUT       
    }
    if (req.method === 'POST') {
        schema = newUserJoiSchema;
        redirectUrl = '/';
    }
    const { error } = schema.validate(req.body);
    
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        req.flash('error', msg );

        res.redirect(redirectUrl);
    } else {
        next();
    }
}

module.exports.filterNonAuthors = async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    const isAuthor = tellIfAuthor( post.author, req );
    if ( !req.session.isAdmin && !isAuthor) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/posts/${id}`);
    }
    next();
}
