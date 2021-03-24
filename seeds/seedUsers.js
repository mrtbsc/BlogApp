// const mongoose = require('mongoose');
const User = require('../models/users');
// const Post = require('../models/posts');

// mongoose.connect('mongodb://localhost:27017/blogApp', { useNewUrlParser: true, useUnifiedTopology: true})
//     .then(() => {
//         console.log("MONGO CONNECTION OPEN!!!")
//     })
//     .catch(err => {
//         console.log("OH NO MONGO CONNECTION ERROR!!!!")
//         console.log(err)
//     })


// const randNumberUpTo = (max) => Math.floor(Math.random() * (max));


module.exports = async function () {

    await User.deleteMany({});
    console.log("Users reset done before seeding");

    const users = ["Helena Thomson", "Fran Martinez", "Mike Smith", "Paula Colomé"];
    await Promise.all(users.map( async (user) => {
        let u = new User({
            username: user, 
            email: `${user.substr(4)}@gmail.com`,
            bio: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur veniam cum possimus iure eius nemo? Beatae quidem rem impedit voluptate iure illo fuga corrupti aspernatur, incidunt sint, exercitationem voluptates est fugit praesentium vitae mollitia ut esse eligendi iusto minima minus.',
            avatar: '',
            posts: []
        });
        console.log(u);
        await u.save();
        
    }));
    
}

// seedUsers().then(() => {
//     mongoose.connection.close();
// })







