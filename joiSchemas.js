const Joi = require('joi');

module.exports.postJoiSchema = Joi.object({
    post: Joi.object({
        title: Joi.string().required(),
        category: Joi.any().required(),
        author: Joi.string(),
        image: Joi.any(),
        body: Joi.string().required()
    }).required()
});

module.exports.categoryJoiSchema = Joi.object({
    category: Joi.object({
        name: Joi.string().required(),
        description: Joi.string(),
    }).required()
});

module.exports.userJoiSchema = Joi.object({
    user: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email(),
        bio: Joi.string(),
        avatar: Joi.string(),
        posts: Joi.array(),
        password: Joi.any(),
        passwordConfirmation: Joi.any()
    }).required()
});