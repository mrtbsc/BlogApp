// schemas.js
const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.postJoiSchema = Joi.object({
    post: Joi.object({
        title: Joi.string().required(),
        category: Joi.any().required(),
        author: Joi.string(),
        body: Joi.string().required(),
        images: Joi.any()
    }).required(),
    deleteImages: Joi.array()
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
        email: Joi.string().email().required(),
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
        email: Joi.string().email().required(),
        bio: Joi.string().allow(''),
        avatar: Joi.string(),
        posts: Joi.array(),
    }).required()
});