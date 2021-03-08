const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    
    name: String,
    email: String,
    bio: String,
    avatar: String,
    posts: [ 
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ]

})

const User = mongoose.model('User', userSchema);
module.exports = User;