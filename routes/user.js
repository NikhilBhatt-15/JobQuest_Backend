import express from "express";
import prisma from "../prisma/prismaClient.js";
import {pfUpload} from "../middlewares/multer.js";
import {createProfile} from "../controllers/userController.js";
import jobSeekerMiddleware from "../middlewares/jobSeekerMiddleware.js";

const app = express.Router();


app.use(jobSeekerMiddleware);
app.post("/profile",pfUpload,createProfile);


export default app;