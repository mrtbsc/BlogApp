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
        console.log(post);

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
        const post = new Post(req.body.post);
        post.date = new Date();
        const author = req.user
        post.author = author;
        post.images = req.files.map(f => ({ url: f.path, filename: f.filename }));

        await post.save();

        const category = await Category.findById(post.category._id);
        category.posts.push(post);
        category.save();

        author.posts.push(post);
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

        console.log('files', req.files);

        const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
        oldPost.images.push(...imgs);
        oldPost.save();
        
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

        if (req.body.deleteImages) {
            // We delete it from cloudinary
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            // We also delete all the mongo references of each image
            await post.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        }
        
        req.flash('success', 'Successfully deleted post')
        res.redirect('/');
    }