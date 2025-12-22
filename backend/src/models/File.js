import mongoose from "mongoose";

const fileSchema= mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    mimeType: {
        type: String
    },
    size: {
        type: Number
    },
    url: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    // users explicitly shared with
    sharedWith: [{
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }],
    // token-based share link
    shareToken: {
        type: String,
        index: true
    },
    shareTokenExpiry: {
        type: Date
    },
    // cloudinary-specific metadata
    format: {
        type: String
    }
},
{
    timestamps: true
})

export const File= mongoose.model("File", fileSchema)