// const mongoose = require('mongoose');
const Category = require('../models/categories');
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

    const randNumberUpTo = (max) => Math.floor(Math.random() * (max));
    
    await Category.deleteMany({});
    console.log("Category reset done before seeding");

    const categories = ["Web Development", "Tech Gadgets", "Business", "Health & Wellness"];
    await Promise.all(categories.map( async (category) => {
        let c = new Category({
            name: category, 
            dateCreated: new Date( 2019, randNumberUpTo(11) + 1, randNumberUpTo(27) + 1 ),
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Modi porro dolores voluptatem, omnis laborum nostrum!',
            posts: []
        });
        console.log(c);
        await c.save();
        
    }));
    
    const amountOfCategories = await Category.countDocuments();
    console.log(amountOfCategories);

}

// seedCategories().then(() => {
//     mongoose.connection.close();
// })







