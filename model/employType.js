const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');


const employTypeSchema = new mongoose.Schema({
    empType: {
        type: String,
        trim: true,


    },
    totalleave: {
        type: Number,
        trim: true,

    },
    probationLeave: {
        type: Number,
        trim: true,
        default: null
    },
    weddingLeave: {
        type: Number,
        trim: true,
        default: null
    },
    bereavementLeave: {
        type: Number,
        trim: true,
        default: null
    },
    casualleave: {
        type: Number,
        trim: true,
        default: null

    },
    sickLeave: {
        type: Number,
        trim: true,
        default: null
    },


}, {
    timestamps: true, toJSON: { virtuals: false }
});

const empType = mongoose.model('empType', employTypeSchema)

module.exports = empType