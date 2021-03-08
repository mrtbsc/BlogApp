const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
    
    title: String,
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    date: Date,
    image: String,
    body: String

})

const Post = mongoose.model('Post', postSchema);
module.exports = Post;