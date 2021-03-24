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

module.exports.newUserJoiSchema = Joi.object({
    user: Joi.object({
        username: Joi.any().required(),
        email: Joi.string().required().email(),
        bio: Joi.string(),
        avatar: Joi.string(),
        posts: Joi.array(),
        password: Joi.any().required(),
        passwordConfirmation: Joi.any().required().valid(Joi.ref('password')).messages({'any.only': "The passwords don't match"})
    }).required()
});

module.exports.editedUserJoiSchema = Joi.object({
    user: Joi.object({
        username: Joi.string().required(),
        email: Joi.string().required().email(),
        bio: Joi.string().allow(''),
        avatar: Joi.string(),
        posts: Joi.array(),
    }).required()
});