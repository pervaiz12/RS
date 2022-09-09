const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');


const employmentSchema = new mongoose.Schema({
    userDefinedCode: {
        type: Number,
        trim: true,

    },
    joiningDate: {
        type: String,
        trim: true
    },
    empGrade: {
        type: String,
        trim: true

    },
    finalAuthority: {
        type: Boolean,
        trim: true
    },
    hod: {
        type: Boolean,
        trim: true

    },
    linemanager: {
        type: Boolean,
        trim: true,

    },
    attendance: {
        type: Boolean,

    },
    location: {
        type: String,
        trim: true,

    },
    branch: {
        type: String,
        trim: true,

    },
    designation: {
        type: String,
        trim: true,

    },
    lineManager: {
        type: String,
        trim: true,

    },
    finAuthority: {
        // type: String,
        type: String,

        trim: true,

    },
    probationPeriod: {
        type: String,
        trim: true,

    },
    employee: {
        type: String,
        trim: true,

    },
    employmed: {
        type: String,
        trim: true,

    },
    department: {
        type: String

    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }
}, {
    timestamps: true, toJSON: { virtuals: false }
});

const Employment = mongoose.model('Employment', employmentSchema)

module.exports = Employment