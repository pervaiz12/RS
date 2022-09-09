const mongoose = require('mongoose')
const userReportSchema = new mongoose.Schema({
    new_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"

    },
    report_to_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"

    },
    assign_by_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"

    },
    assign_Date: {
        type: String

    }
}, {
    timestamps: true, toJSON: { virtuals: true }
});

const user_report = mongoose.model('user_report', userReportSchema)

module.exports = user_report