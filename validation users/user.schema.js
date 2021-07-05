const joi = require('joi');

const userValidation = data => {
    const schema = joi.object().keys({
        firstname: joi.string().regex(/^[A-Za-z]+$/).required(),
        lastname: joi.string().regex(/^[A-Za-z]+$/).required(),
        email: joi.string().email().lowercase().required(),
        password: joi.string().pattern(new RegExp("^[A-Za-z0-9]{3,20}$")).required(),
        country: joi.string().max(20).required(),
        city: joi.string().max(20).required(),
        mobile: joi.number().integer().min(1000000000).message("Invalid mobile number").max(9999999999).message("Invalid mobile number").required(),
        profileimage: joi.string(),
        role: joi.string().valid('ADMIN', 'GENERAL').uppercase().required()
    }).unknown();
    return schema.validate(data);
}
module.exports.userValidation = userValidation;