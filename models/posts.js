const mongoose = require('mongoose');
const { Schema } = mongoose;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const postSchema = new Schema({
    
    title: String,
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    date: Date,
    images: [ImageSchema],
    body: String

})

const Post = mongoose.model('Post', postSchema);
module.exports = Post;