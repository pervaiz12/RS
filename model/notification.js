const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');


const notificationSchema = new mongoose.Schema({
    leaveRequest_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "leaveRequest"
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    reciever_id: {

        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    message: {
        type: String

    },
    notificationtype: {
        type: String, enum: [1, 2, 3, 4, 5]

    },
    isread: {
        type: Boolean

    }


}, {
    timestamps: true, toJSON: { virtuals: false }
});

const Notification = mongoose.model('Notification', notificationSchema)

module.exports = Notification