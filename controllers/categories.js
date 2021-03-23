const Post = require('../models/posts');
const Category = require('../models/categories');
const User = require('../models/users');


/*** READ FUNCTIONS ***/

module.exports.displayIndex = async (req, res) => {
        const categories = await Category.find();
        res.render('categories/index', { categories });
    }

module.exports.displayCategory = async (req, res) => {
        const category = await Category.findById(req.params.id).
        populate({path: 'posts', populate: 'author'});
        if (!category) {
            req.flash('error', 'Cannot find that category!');
            return res.redirect('/categories');
        }
        const posts = category.posts;

        res.render('categories/show', { category , posts });
    }

/*** WRITE FUNCTIONS ***/

module.exports.createCategory = async (req, res) => {
        const category = new Category( req.body.category );
        const existingCategories = await Category.find({name: category.name });
        if (existingCategories.length) {
            req.flash('error', 'A category with the same name already exists!');
            return res.redirect('/categories');
        }
        category.dateCreated = new Date();
        await category.save();

        req.flash('success', 'Successfully created category!');
        res.redirect('/');
        
    }

module.exports.deleteCategory = async (req, res) => {
        const category = await Category.findByIdAndDelete(req.params.id).
        populate({path: 'posts', populate: 'author'});
        for (post of category.posts) {
                await User.findByIdAndUpdate(post.author, { $pull: { posts: post.id } });
                await Post.findByIdAndDelete(post.id);
            }

        req.flash('success', 'Successfully deleted category!');
        res.redirect('/categories');
    }

module.exports.UpdateCategory = async (req, res) => {
        const { id } = req.params;
        await Category.findByIdAndUpdate(id, {...req.body.category} );

        req.flash('success', 'Successfully updated category!');
        res.redirect(`/categories/${id}`); 
    }