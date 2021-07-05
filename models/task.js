const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    country: String,
    city: String,
    mobile: Number,
    profileimage: String,
    role: { "type": String, "enum": ["Admin", "General"] }
});

module.exports = mongoose.model('users', userSchema);