import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema= mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please enter a valid email address'
            ]
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        fullName: {
            type: String,
            required: true,
            trim: true
            // ❌ NO unique here
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [
                /^[0-9]\d{9}$/,
                'Please enter a valid Indian phone number'
            ]
        }
    },
    {
        timestamps: true,
    }
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password"))
        return next();

    this.password = await bcrypt.hash(this.password, 10)
        return next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    // console.log("password : ",this.password)
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function(){
    // console.log("email :",this.email)
    return await jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};


userSchema.methods.generateRefreshToken = async function(){
    // console.log("email :",this.email);
    return await jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User= mongoose.model("User", userSchema)