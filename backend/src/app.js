import express from "express"
import cors from 'cors'

const app= express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "100mb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.routes.js"
import fileRouter from "./routes/file.routes.js"
import cookieParser from "cookie-parser"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/files", fileRouter)

export default app