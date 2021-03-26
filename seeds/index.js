const mongoose = require('mongoose');
const Category = require('../models/categories');
const User = require('../models/users');
const Post = require('../models/posts');
const seedCategories = require('./seedCategories');
const seedUsers = require('./seedUsers');

require('dotenv').config()
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/blogApp";


/**************** CONNECT WITH THE DB ****************/
mongoose.connect( dbUrl, { //'mongodb://localhost:27017/blogApp', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false 
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => { console.log("Database connected"); });

const randNumberUpTo = (max) => Math.floor(Math.random() * (max));



const amountOfCategories = 4;
const getRandomCategory = async () => {
    try {
        const rand = randNumberUpTo(amountOfCategories);
        console.log(randNumberUpTo);
        const category = await Category.findOne().skip(rand);
        return category;
    } catch (e) {
        throw e;
    }
}

const amountOfUsers = 4;
const getRandomUser = async () => {
    try {
        const rand = randNumberUpTo(amountOfUsers);
        console.log(randNumberUpTo);
        const user = await User.findOne().skip(rand);
        return user;
    } catch (e) {
        throw e;
    }
}

const emptyPosts  = async () => {
    try {
    const postsExist = await Post.find();
    if (postsExist) {
        await Post.deleteMany({});
        console.log("Post reset done before seeding");
    }
    } catch (e) {
        throw e;
    }
}


async function seedPosts () {

    try {

        await seedCategories();
        await seedUsers();
        await emptyPosts();
        for(let i=1; i<7; i++) {
    
            p = new Post({
                title: "Post " + i,
                category: await getRandomCategory(),
                author: await getRandomUser(),
                date: new Date( 2020, randNumberUpTo(11) + 1, randNumberUpTo(27) + 1 ),
                images: [
                    {
                    url: 'https://res.cloudinary.com/dec2ratwh/image/upload/v1616510336/BlogApp/txpqwzjcoterjksvrvbh.jpg',
                    filename: 'BlogApp/txpqwzjcoterjksvrvbh'
                    },
                    {
                    url: 'https://res.cloudinary.com/dec2ratwh/image/upload/v1616510338/BlogApp/fqb48rwkndkqq7yf4qwv.jpg',
                    filename: 'BlogApp/fqb48rwkndkqq7yf4qwv'
                    }
                ],
                body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Mollitia nihil laboriosam a. Culpa quia sapiente pariatur, architecto officia praesentium saepe libero ipsa dolore ullam corporis ipsam esse, laborum possimus quos."
            });

            console.log(p);

            await p.save();

            await Category.findByIdAndUpdate(p.category, { $push: { posts: p._id } });
            await User.findByIdAndUpdate(p.author, { $push: { posts: p._id } });
        }
    } catch (e) {
        console.log(e)
    }
};

seedPosts().then( () => {
    mongoose.connection.close();
})





