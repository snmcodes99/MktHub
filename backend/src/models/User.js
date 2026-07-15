const mongoose = require("mongoose");
const validator = require("validator");
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, "please Enter the email"]
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ["ADMIN", "CUSTOMER", "SELLER"],
        default: "CUSTOMER",
        required: true
    },
    isBanned: {
        type: Boolean,
        default: false
    }
    ,
    phoneNo: {
        type: String,
        trim: true,
    },
    address: {
        street: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            trim: true
        },
        zipcode: {
            type: String,
            trim: true
        }
    },
    passwordResetToken: {
        type: String,
        select: false
    },

    passwordResetExpires: {
        type: Date,
        select: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },

    emailVerificationToken: {
        type: String,
        select: false
    },

    emailVerificationExpires: {
        type: Date,
        select: false
    },
    lastVerificationEmailSentAt: {
        type: Date,
        select: false
    }
}, {
    timestamps: true
})

UserSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel