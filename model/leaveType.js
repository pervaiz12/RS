const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');


const leaveTypeSchema = new mongoose.Schema({
    balance: {
        type: Number,
        trim: true,

    },
    leavetype: {
        type: String,
        trim: true,

    },
    availed: {
        type: Number,
        trim: true
    },
    available: {
        type: Number,
        trim: true
    },
    pending: {
        type: Number,
        trim: true
    },
    user_id: {

        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }


}, {
    timestamps: true, toJSON: { virtuals: false }
});

const leaveType = mongoose.model('leaveType', leaveTypeSchema)

module.exports = leaveType