const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        refreshTokenHash: {
            type: String,
            required: true,
            unique: true
        },

        expiresAt: {
            type: Date,
            required: true
        },

        revokedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
)

sessionSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
)
sessionSchema.set("toJSON",{
    transform:function(doc,ret){
        delete ret.__v;
        return ret;
    }
})

const SessionModel = mongoose.model("Session", sessionSchema)

module.exports = SessionModel