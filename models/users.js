const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    
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
UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', UserSchema);

module.exports = User;