import { Router } from "express";
import {
    registerFile,
    getFile,
    shareWithUsers,
    ShareLink,
    removeSharedUsers,
    ownedFiles,
    sharedFiles,
    fetchLinkByUrl
} from "../controllers/File.Controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

// upload files
router.route("/register").post(verifyJWT, upload.fields([
    {
        name: "addFiles",
        maxCount: 10
    }
]),
    registerFile)

// list user's files (owner + shared)
router.route("/owned").get(verifyJWT, ownedFiles)
router.route("/shared").get(verifyJWT, sharedFiles)

// share with specific users
router.route("/share/:fileId").post(verifyJWT, shareWithUsers)

// file metadata
router.route("/:id").get(verifyJWT, getFile)

// create a share link (owner only)
router.route("/shareLink/:id").post(verifyJWT, ShareLink)
router.route("/open/:fileId/:expiryDate").get(verifyJWT, fetchLinkByUrl)

// remove users from shared list
router.route("/:id/shared-users").delete(verifyJWT, removeSharedUsers)

export default router
