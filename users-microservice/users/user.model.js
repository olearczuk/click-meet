const mongoose = require('mongoose');
const isEmail = require('validator').isEmail;
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    hash: { type: String, required: true },
    email: { 
        type: String, 
        validate: {
            validator: isEmail,
            message: '{VALUE} is not a valid email',
            isAsync: false,
        }, 
        required: true, unique: true },
    professor: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);