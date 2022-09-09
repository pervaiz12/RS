const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');


const userProfileSchema = new mongoose.Schema({
    img: {
        type: String,
        trim: true,

    },
    salutation: {
        type: String,
        trim: true
    },
    fatherName: {
        type: String,
        trim: true

    },
    gender: {
        type: String,
        trim: true
    },
    maritalStatus: {
        type: Boolean,
        trim: true

    },
    religion: {
        type: String,
        trim: true,

    },
    nationality: {
        type: String,
        minlength: 5
    },
    bloodgroup: {
        type: String,
        trim: true,

    },
    dob: {
        type: String,
        trim: true,

    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
      }
}, {
    timestamps: true, toJSON: { virtuals: true }
});



const UserProfile = mongoose.model('UserProfile', userProfileSchema)

module.exports = UserProfile