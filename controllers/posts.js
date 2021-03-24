const Post = require('../models/posts');
const Category = require('../models/categories');
const User = require('../models/users');
const tellIfAuthor = require('../utils/tellIfAuthor');

async function findByIdAndPopulate (req, res) {
    const post = await Post.findById( req.params.id )
        .populate('category', 'name')
        .populate('author', 'username');
    
    if (!post) {
        req.flash('error', 'Cannot find that post!');
        return res.redirect('/posts');
    }

    else {
        const author = post.author;
        return { post, author }
    }
}

/*** READ FUNCTIONS ***/

module.exports.displayIndex =  async (req, res) => {
        const posts = await Post.find()
            .populate('category', 'name')
            .populate('author', 'username');

        res.render('posts/index', { posts });
    }

module.exports.displayPost = async (req, res) => {
        const { post, author } = await findByIdAndPopulate(req, res);
        const isAuthor = tellIfAuthor( author, req );

        res.render('posts/show', { post, isAuthor  } );
    }

module.exports.displayUpdateForm = async (req, res) => {
        const { post, author } = await findByIdAndPopulate(req, res);
        const isAuthor = tellIfAuthor( author, req );
        const allCategories = await Category.find({}, 'name');

        res.render('posts/edit', { post, allCategories, isAuthor } );
    }

/*** WRITE FUNCTIONS ***/

module.exports.createPost = async (req, res) => {
        const p = new Post(req.body.post);
        p.date = new Date();
        const author = req.user
        p.author = author;
        await p.save();

        const category = await Category.findById(p.category._id);
        category.posts.push(p);
        category.save();

        author.posts.push(p);
        author.save();

        req.flash('success', 'Successfully created post')
        res.redirect("/");
    }

module.exports.updatePost = async (req, res) => {
        const { id } = req.params;  
        const newCategoryId = req.body.post.category; // String 
            
        const oldPost = await Post.findByIdAndUpdate(id, { ...req.body.post } );
        const oldCategoryId = oldPost.category._id; // IdObject type
        
        if (!oldCategoryId.equals(newCategoryId)) {
            await Category.findByIdAndUpdate(oldCategoryId, { $pull: { posts: id } });
            await Category.findByIdAndUpdate(newCategoryId, { $push: { posts: id } });            
        }
        
        req.flash('success', 'Successfully updated post')
        res.redirect(`/posts/${id}`);   
    }

module.exports.deletePost = async (req, res) => {
        const { id } = req.params;
        const { category , author } = await Post.findByIdAndDelete(id)
            .populate('category')
            .populate('author');

        await Category.findByIdAndUpdate(category, { $pull: { posts: id } });
        await User.findByIdAndUpdate(author, { $pull: { posts: id } });
        
        req.flash('success', 'Successfully deleted post')
        res.redirect('/');
    }