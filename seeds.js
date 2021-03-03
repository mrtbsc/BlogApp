const mongoose = require('mongoose');
const Post = require('./models/posts');

mongoose.connect('mongodb://localhost:27017/blogApp', { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

    Post.deleteMany({}).then( function() {
        console.log("Reset done before seeding");
    });

    const randNumberUpTo = (max) => Math.floor(Math.random() * (max + 1));
    const categories = ["Web Development", "Tech Gadgets", "Business", "Health & Wellness"];
    let p;

    try {
        for(let i=1; i<7; i++) {
    
            p = new Post({
                title: "Post " + i,
                category: categories[randNumberUpTo(3)],
                date: new Date( 2020, randNumberUpTo(11) + 1, randNumberUpTo(27) + 1 ),
                image: "",
                body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Mollitia nihil laboriosam a. Culpa quia sapiente pariatur, architecto officia praesentium saepe libero ipsa dolore ullam corporis ipsam esse, laborum possimus quos."
            });

            console.log(p);

            p.save()
                .then(p => console.log(p));
        }
    } catch (e) {
        console.log(e)
    }




