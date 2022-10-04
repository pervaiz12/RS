const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');

// quick contact Schema
const ContactInfoSchema = mongoose.Schema({
    lineNumber: {
        type: String,
        minlength: 3,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        minlength: 3,
        trim: true
    },
    mobile: {
        type: String,
        minlength: 3,
        trim: true
    },
});

// Id card schema

const IdentityCardSchema = mongoose.Schema({
    CNIC: {
        type: String,
        unique: true,
        minlength: 13,
        maxlength: 13

    },
    CNICImage: {
        type: String,
        trim: true
    },
    CNICExpire: {
        type: String,
        trim: true
    },
});

// Passport Schema
const passportSchema = mongoose.Schema({
    passportNo: {
        type: String,
        unique: true,


    },
    passportImage: {
        type: String,
        trim: true
    },
    passportExpire: {
        type: String,
        trim: true
    },
});

// Driving Schema
const DrivingSchema = mongoose.Schema({
    licenseNo: {
        type: String,
        unique: true,
    },
    licenseImage: {
        type: String,
        trim: true
    },
    liceseExpire: {
        type: String,
        trim: true
    },
});


// Driving Schema
const imgSchema = mongoose.Schema({
    licenseNo: {
        type: String,
        unique: true,
    },
    licenseImage: {
        type: String,
        trim: true
    },
    liceseExpire: {
        type: Date,
        trim: true
    },
});



const userSchema = new mongoose.Schema({
    IdentityCard: IdentityCardSchema, //for id card schema
    passport: passportSchema, // for passport
    Driving: DrivingSchema, // for driving
    quickContact: ContactInfoSchema, //quickContact Schema

    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,

    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Friends' }],

    emptype_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "empType"
    },
    empleave: {
        type: Number
    },
    fname: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true

    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is in valid')
            }
        },
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50

    },
    company: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50

    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    role: { type: String, enum: ['admin', 'manager', 'hr', 'user'], required: true },



    userProfile: [


        {

            img: {
                profile_pic: {
                    original: String,
                    100: String,
                    250: String,
                    550: String,
                }

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
                type: String,
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
            _id: false
        }

    ]
}, {
    timestamps: true, toJSON: { virtuals: true }
});


userSchema.virtual("user_report", {
    ref: "user_report",
    foreignField: "new_user_id",
    localField: "_id"
});

userSchema.virtual("leaveRequest", {
    ref: "leaveRequest",
    foreignField: "user_id",
    localField: "_id"
});

userSchema.virtual("Employment", {
    ref: "Employment",
    foreignField: "user_id",
    localField: "_id"
});



//   userSchema.virtual("user_report", {
//     ref: "user_report",
//     foreignField: "report_to_id",
//     localField: "_id"
//   });

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})
const Users = mongoose.model('Users', userSchema)

module.exports = Users