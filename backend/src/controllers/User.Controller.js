import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const options = {
    httpOnly : true,
    secure : true
}

const generateAccessAndRefreshToken = async (userId) =>{
    try{
        const user = await User.findById(userId);
        const accessToken= await user.generateAccessToken();
        // console.log('accessToken :',accessToken)
        const refreshToken = await user.generateRefreshToken();
        // console.log('refreshToken :',refreshToken)

        user.refreshToken=refreshToken;
        user.save({validateBeforeSave : false})

        return {accessToken,refreshToken}
    }
    catch{
        throw new ApiError(500,
            "Error while generating Access and refresh token"
        )
    }
}

const registerUser = asyncHandler( async (req, res) => {

    const {fullName, email, username, password, phoneNumber} = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password, phoneNumber].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }, {phoneNumber}]
    })

    if (existedUser) {
        throw new ApiError(409, `User with
            username: ${ username } or
            email: ${ email } or
            password: ${phoneNumber} already exists`)
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        phoneNumber
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler( async(req,res) =>{
    // username and password of the user are matching
    // return 401(autherization error) if they don't match
    // return access token if they match so he can preform cred op's
    // if the access token expires return the new access token by taking refresh token

    const {email , password} =req.body;

    if(!email && !password){
        throw new ApiError(
            400,
            "provide an email and password"
        )
    }

    // console.log('email : ',email);

    const user = await User.findOne({
        $or: [{ email: email }]
    })

    // console.log("user : ",user);
    // console.log("email : ",user.email);

    if(!user){
        throw new ApiError(404,'user not found')
    }

    // console.log("password : ",password);

    const password_validator=await user.isPasswordCorrect(password);

    if(!password_validator)
    {
        throw new ApiError(401,'incorrect password')
    }

    const {accessToken,refreshToken} =await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    // console.log("refresh token :",refreshToken)

    // console.log("Response Data:", {
    //     user: { loggedInUser, accessToken, refreshToken },
    // });

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
        200,
        {
            user : {loggedInUser,accessToken,refreshToken}
        },
        "User logged in Succesfully"
        )
    )
})

const logoutUser = asyncHandler( async(req,res)=>{
    // remove refresh token from User
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    return await res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(
        200,
        {},
        "User Logged out"
    ))
})

const getAccessTokenThroughRefreshToken = asyncHandler(async(req,res)=>{

    const userRefreshToken = (req.cookies.refreshToken || req.body.refreshToken)

    if(!userRefreshToken){
        throw new ApiError (
            401,
            "No refresh token found"
        )
    }

    try {
        const decodedRefreshToken = await jwt.verify(userRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById({
            _id : decodedRefreshToken?._id
        })
    
        // No need to check for refresh token passed and db refresh token because
        // jwt has signed the refreshToken when we pass "userRefreshToken" to jwt.verify()
        // it checks for signature as well
    
        if(!user){
            throw  ApiError(
                401,
                "Invalid Refresh token"
            )
        }
    
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken : refreshToken},
                "accessToken refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "Invalid refresh token"
        )
    }

})

const changePassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword, confirmPassword} = req.body;

    // console.log("oldPassword :",oldPassword);
    // console.log("newPassword :",newPassword);
    // console.log("confirmPassword :",confirmPassword);

    if(newPassword != confirmPassword){
        throw new ApiError(
            401,
            "new password and confirm password are not matching"
        )
    }

    const user =await User.findById({
        _id : req.user._id
    })

    // console.log("user :",user)

    const passwordValidation = await user.isPasswordCorrect(oldPassword)

    if(!passwordValidation){
        throw new ApiError(
            401,
            "provide correct password"
        )
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})
    
    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            {},
            "password changed succesfully"
        )
    )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    const user = await req.user;

    if(!user){
        throw new ApiError(
            401,
            "User not logged in"
        )
    }

    // console.log("user :",user)

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {
            user
        },
        "current User fetched Succesfully"
    ))
})

// const updateAccountDetails = asyncHandler(async(req,res)=>{
//     const {fullName, email} = await req.body;

//     if(!fullName || !email){
//         throw new ApiError(
//             401,
//             "both email and fullName are required"
//         )
//     }
//     const user = await User.findByIdAndUpdate(
//         req.user?._id,
//         {
//             $set : {
//                 fullName,
//                 email
//             }
//         },
//         {
//             new : true,
//         }
//     ).select("-password -refreshToken")
//     return res
//     .status(201)
//     .json(
//         new ApiResponse(
//             201,
//             user,
//             "User Updated Succesfully"
//         )
//     )
// })

export {
    registerUser,
    loginUser,
    logoutUser,
    getAccessTokenThroughRefreshToken,
    changePassword,
    getCurrentUser
}