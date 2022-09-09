const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');


const userAccountSchema = new mongoose.Schema({
    timeZone: {
        type: String,
        trim: true,

    },
    role: {
        type: String,
        trim: true
    },
    user_id: {
        
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
      }
   
    
}, {
    timestamps: true, toJSON: { virtuals: false }
});

const UserAccount = mongoose.model('UserAccount', userAccountSchema)

module.exports = UserAccount