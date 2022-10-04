const mongoose = require('mongoose')
const leaveRequestSchema = new mongoose.Schema({
    leaveType: {
        type: String,
        required: true,

    },
    short: {
        type: Boolean,
        // default: false
        default: null



    },
    status: { type: String, enum: ['pending', 'reject', 'complete'] },

    shortLeaveType: {
        type: String,
        required: true,

    },
    startDate: {
        type: String,
        required: true,

    },
    endDate: {
        type: String,
        required: true,

    },
    count: {
        type: Number,
        required: true,

    },
    totalCount: {
        type: Number,


    },
    attachment: {
        type: String,
        // required: true,
        default: null


    },
    reason: {
        type: String,
        required: true

    },
    user_id: {

        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    report_to_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user_report"
    }


}, {
    timestamps: true, toJSON: { virtuals: false }
});

const leaveRequest = mongoose.model('leaveRequest', leaveRequestSchema)

module.exports = leaveRequest