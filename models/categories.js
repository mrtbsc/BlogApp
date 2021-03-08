const mongoose = require('mongoose');
// const Post = require('./posts');
const { Schema } = mongoose;

const categorySchema = new Schema({
    
    name: String,
    dateCreated: Date,
    description: String,
    posts: [ 
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ]

})

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;