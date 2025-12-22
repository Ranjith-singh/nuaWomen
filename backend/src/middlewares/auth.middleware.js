import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken"
import {User} from '../models/User.js';

export const verifyJWT = asyncHandler( async(req, _, next)=>{
    try{
        const token = await req.cookies?.accessToken || req
        .header("Authorization")?.replace('Bearer ',"")

        if(!token){
            throw new ApiError(401,"Unauthorized Request")
        }

        const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        .select("-password -refreshToken")

        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }

        req.user = user
        next()
    }
    catch{
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})