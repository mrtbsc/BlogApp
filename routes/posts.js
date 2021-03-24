const express = require('express');
const router = express.Router();

var multer  = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const catchAsync = require('../utils/catchAsync');
const { validatePost, filterNonAuthors } = require('../middleware');
const posts = require('../controllers/posts');


    router.route('/')
        .get(catchAsync(posts.displayIndex))
        .post( upload.array('images'), validatePost , catchAsync( posts.createPost ));

    router.route('/:id')
        .get( catchAsync( posts.displayPost ))
        .put( filterNonAuthors, upload.array('images'), validatePost , catchAsync( posts.updatePost ))
        .delete( filterNonAuthors, catchAsync( posts.deletePost ));

    router.get('/:id/edit', catchAsync( posts.displayUpdateForm ));


module.exports = router;