import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getAccessTokenThroughRefreshToken,
    changePassword,
    getCurrentUser} from "../controllers/User.Controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router= Router()

// router.route("/hello").get((req, res)=>{
//     res.send({
//         key: "hello"
//     })
// });

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

router.route("/logout").get(verifyJWT,logoutUser)

router.route("/refreshAccessToken").post(getAccessTokenThroughRefreshToken)

router.route("/changePassword").post(verifyJWT,changePassword)

router.route("/getUserDetails").post(verifyJWT,getCurrentUser)

export default router