import { File } from "../models/File.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import axios from "axios";

// allowed mimetypes and max size in bytes (default 20MB)
const MAX_FILE_SIZE= 20 * 1024 * 1024;

const registerFile = asyncHandler( async (req, res) => {
    const files= req.files?.addFiles || [];
    if(!files || files.length===0){
        throw new ApiError(400, "provide files to upload")
    }

    const createdFiles = [];
    for(const file of files){
        if(!file || !file.path){
            throw new ApiError(400, `invalid file provided`)
        }
        // validate type and size
        if(file.size > MAX_FILE_SIZE){
            throw new ApiError(400, `file ${file.originalname} exceeds size limit`)
        }

        let fileUploadResponse;
        try{
            // console.log(`file: ${file.originalname}`);
            fileUploadResponse = await uploadOnCloudinary(file.path)
            // console.log(`fileUploadResponse: ${fileUploadResponse}`);
        }
        catch(err){
            throw new ApiError(500, `Upload failed for ${file.originalname}: ${err?.message || 'unknown error'}`)
        }
        const createdFile= await File.create({
            filename: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: fileUploadResponse.url,
            owner: req.user._id,
            shareWith: [],
            format: fileUploadResponse.format
        })
        // console.log(createdFile.filename);
        createdFiles.push(createdFile.filename)
    }

    return res.status(201).json(
        new ApiResponse(201, "Files registered Successfully", { files: createdFiles })
    )
})

const ownedFiles = asyncHandler( async (req, res) => {
    const userId = req.user._id

    const files = await File.find({
        $or: [ { owner: userId }]
    }).sort({ createdAt: -1 })

    return res.status(200).json(new ApiResponse(200, "Files fetched", { files }))
})

const shareWithUsers = asyncHandler( async (req, res) => {
    // console.log(req.user._id)
    // console.log(req.body.emails)
    const fileId = req.params.fileId
    const emails = req.body.emails // expected: ["email1","email2"]

    // console.log("fileId: ",fileId);
    if(!fileId){
        throw new ApiError(400, "Invalid file id")
    }
    // console.log(emails);
    if(!emails){
        throw new ApiError(400, "Provide emails to share with")
    }

    const file = await File.findById(fileId)
    // console.log("file: ",file);
    if(!file) throw new ApiError(404, "File not found")

    // console.log("file.owner.toString(): ",file.owner.toString());
    // console.log("logged in user: ",req.user._id.toString());
    if(file.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Only owner can share the file")
    }

    // filter valid object ids
    const userIds= await User.find({
        email: { $in: emails }
    });
    // console.log("userIds: ",userIds);
    const validIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id) && id !== req.user._id.toString())

    file.sharedWith = Array.from(new Set([...(file.sharedWith || []).map(String), ...validIds]))
    await file.save()

    // console.log(file.sharedWith);
    return res.status(200).json(new ApiResponse(200, "File shared", { sharedWith: emails }))
})

const sharedFiles = asyncHandler( async (req, res) => {
    const userId = req.user._id

    // console.log("files: ",await File.find({
    //     $or: [ { sharedWith: userId }]
    // }).sort({ createdAt: -1 }).map(file=> file.filename))
    const files = await File.find({
        $or: [ { sharedWith: userId }]
    }).sort({ createdAt: -1 });
    const fileMetadata= files.map((file)=> ({
        filename: file.filename,
        id: file._id,
        size: file.size,
        createdAt: file.createdAt}))

    return res.status(200).json(new ApiResponse(200, { fileMetadata }, "Files fetched"))
})

const getFile = asyncHandler( async (req, res) => {
    const fileId = req.params.id

    if(!mongoose.Types.ObjectId.isValid(fileId)){
        throw new ApiError(400, "Invalid file id")
    }

    const file = await File.findById(fileId)
    if(!file) throw new ApiError(404, "File not found")

    const userId = req.user._id.toString()
    const isOwner = file.owner.toString() === userId
    const isShared = (file.sharedWith || []).map(String).includes(userId)

    if(!isOwner && !isShared){
        throw new ApiError(403, "Forbidden")
    }

    const response = await axios({
            url: file.url,
            method: 'GET',
            responseType: 'stream'
        });
    res
        .setHeader('Content-Type', response.headers['content-type'])
        .status(200)
    ;
    return response.data.pipe(res);
})

const getSignedUrl = asyncHandler( async(req, res) => {
    const fileId = req.params.id

    if(!mongoose.Types.ObjectId.isValid(fileId)){
        throw new ApiError(400, "Invalid file id")
    }

    const file = await File.findById(fileId)
    if(!file) throw new ApiError(404, "File not found")

    const userId = req.user._id.toString()
    const isOwner = file.owner.toString() === userId
    const isShared = (file.sharedWith || []).map(String).includes(userId)

    if(!isOwner && !isShared){
        throw new ApiError(403, "Forbidden")
    }

    // generate a signed url using cloudinary public_id
    const signedUrl = file.public_id ?
        // cloudinary.url will generate signed url when requested; return stored url otherwise
        await (async ()=>{
            try{
                // lazy import to avoid circular deps in tests
                const {v2: cloudinary} = await import('cloudinary')
                const url = cloudinary.url(file.public_id, {
                    resource_type: file.resource_type || 'auto',
                    sign_url: true,
                    format: file.format || undefined,
                    version: undefined
                })
                return url
            }
            catch{
                return file.url
            }
        })()
        : file.url

    return res.status(200).json(new ApiResponse(200, "Signed URL", { url: signedUrl }))
})

const ShareLink = asyncHandler( async(req, res) => {
    const fileId = req.params.id

    // console.log(req);
    const expireDateTime= new Date(req.body.expireDateTime)
    const unixTimestamp = Math.floor(expireDateTime.getTime() / 1000);

    if(!mongoose.Types.ObjectId.isValid(fileId)){
        throw new ApiError(400, "Invalid file id")
    }

    const file = await File.findById(fileId)
    if(!file) throw new ApiError(404, "File not found")

    if(file.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Only owner can create share links")
    }

    const url= `/open/${fileId}/${unixTimestamp.toString()}`;
    // console.log("url: ",url);

    return res.status(200).json(new ApiResponse(200, {
        url: `${process.env.BACKEND_URL}${req.baseUrl}${url}`,
    }))
})

const fetchLinkByUrl= asyncHandler(async(req, res)=>{
    const fileId= req.params.fileId
    const expiryDate= req.params.expiryDate

    // console.log({
    //     fileId,
    //     expiryDate
    // })
    const file= await File.findById(fileId)

    const response = await axios({
            url: file.url,
            method: 'GET',
            responseType: 'stream'
        });
    res
        .setHeader('Content-Type', response.headers['content-type'])
        .status(200)
    ;

    if(!response){
        throw new ApiError(400, "unable to open file from url")
    }
    return response.data.pipe(res);
})

const accessByShareToken = asyncHandler( async (req, res) => {
    const token = req.params.token

    if(!token) throw new ApiError(400, "Invalid token")

    const file = await File.findOne({ shareToken: token })
    if(!file) throw new ApiError(404, "Invalid or expired token")

    if(file.shareTokenExpiry && file.shareTokenExpiry < new Date()){
        throw new ApiError(410, "Link expired")
    }

    // user must be authenticated (route will ensure verifyJWT)

    // return signed url
    const signedUrl = file.public_id ?
        await (async ()=>{
            try{
                const {v2: cloudinary} = await import('cloudinary')
                return cloudinary.url(file.public_id, { resource_type: file.resource_type || 'auto', sign_url:true})
            }
            catch{
                return file.url
            }
        })()
        : file.url

    return res.status(200).json(new ApiResponse(200, "Signed URL via token", { url: signedUrl }))
})

const revokeShareLink = asyncHandler( async (req, res) => {
    const fileId = req.params.id

    if(!mongoose.Types.ObjectId.isValid(fileId)){
        throw new ApiError(400, "Invalid file id")
    }

    const file = await File.findById(fileId)
    if(!file) throw new ApiError(404, "File not found")

    if(file.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Only owner can revoke share link")
    }

    file.shareToken = undefined
    file.shareTokenExpiry = undefined
    await file.save()

    return res.status(200).json(new ApiResponse(200, "Share link revoked"))
})

const removeSharedUsers = asyncHandler( async (req, res) => {
    const fileId = req.params.id
    const { userIds } = req.body

    if(!mongoose.Types.ObjectId.isValid(fileId)){
        throw new ApiError(400, "Invalid file id")
    }

    const file = await File.findById(fileId)
    if(!file) throw new ApiError(404, "File not found")

    if(file.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Only owner can modify shared users")
    }

    if(!userIds || !Array.isArray(userIds)){
        throw new ApiError(400, "Provide userIds array to remove")
    }

    const remaining = (file.sharedWith || []).map(String).filter(id => !userIds.includes(id))
    file.sharedWith = remaining
    await file.save()

    return res.status(200).json(new ApiResponse(200, "Shared users updated", { sharedWith: file.sharedWith }))
})

export {
    registerFile,
    ownedFiles,
    sharedFiles,
    getFile,
    getSignedUrl,
    shareWithUsers,
    ShareLink,
    accessByShareToken,
    revokeShareLink,
    removeSharedUsers,
    fetchLinkByUrl
}