const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
    
    title: String,
    category: {
        type: String,
        enum: ["Web Development", "Tech Gadgets", "Business", "Health & Wellness"]
    },
    date: Date,
    image: String,
    body: String

})

const Post = mongoose.model('Post', postSchema);
module.exports = Post;