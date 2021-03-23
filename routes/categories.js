const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const { validateCategory } = require('../middleware');
const categories = require('../controllers/categories');

    router.route('/')
        .get(catchAsync( categories.displayIndex ))
        .post(validateCategory, catchAsync( categories.createCategory ));

    router.route('/:id')
        .get(catchAsync( categories.displayCategory ))
        .put( validateCategory, catchAsync( categories.UpdateCategory ))
        .delete( catchAsync( categories.deleteCategory ));


module.exports = router;