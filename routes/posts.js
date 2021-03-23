const express = require('express');
const router = express.Router();

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

const catchAsync = require('../utils/catchAsync');
const { validatePost, filterNonAuthors } = require('../middleware');
const posts = require('../controllers/posts');

    router.route('/')
        .get(catchAsync(posts.displayIndex))
        .post(upload.array('postImages'), validatePost , catchAsync( posts.createPost ));

    router.route('/:id')
        .get( catchAsync( posts.displayPost ))
        .put( filterNonAuthors, upload.array('postImages'), validatePost , catchAsync( posts.updatePost ))
        .delete( filterNonAuthors, catchAsync( posts.deletePost ));

    router.get('/:id/edit', catchAsync( posts.displayUpdateForm ));


module.exports = router;