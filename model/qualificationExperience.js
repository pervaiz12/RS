const mongoose = require('mongoose')

const qualificationExperienceSchema = new mongoose.Schema({

    experience: [
        {
            companyName: {
                type: String,

            },
            startDate: {
                type: Date,
            },
            endDate: {
                type: Date,
            },
            experiencCertification: {
                type: String
            },
        },
    ],
    qualification: [
        {
            schoolName: {
                type: String,

            },
            resultDeclar: {
                type: Date,
            },
            cgp: {
                type: Number
            },
            resultCard: {
                type: String
            }
        },
    ],

    certification: [
        {
            Name: {
                type: String,

            },

            certificateImage: {
                type: String
            }
        },
    ],
    user_id: {

        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }


}, {
    timestamps: true, toJSON: { virtuals: false }
});

const Qualification = mongoose.model('Qualification', qualificationExperienceSchema)

module.exports = Qualification