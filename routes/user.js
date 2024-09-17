import express from "express";
import prisma from "../prisma/prismaClient.js";
import {pfUpload, resumeUpload, singleUpload} from "../middlewares/multer.js";
import {
    addEducation, addExperience,
    addResume,
    addSkills,
    createProfile, getDefaultSkills,
    getJobs,
    getProfile,
    removeSkills
} from "../controllers/userController.js";
import jobSeekerMiddleware from "../middlewares/jobSeekerMiddleware.js";

const app = express.Router();


app.use(jobSeekerMiddleware);
app.post("/profile",singleUpload,createProfile);
app.put("/profile",singleUpload,createProfile);
app.get("/profile",getProfile)
app.post("/profile/resume",resumeUpload,addResume);
app.put("/profile/resume",resumeUpload,addResume);
app.post("/profile/education",addEducation);
app.post("/profile/skills",addSkills);
app.delete("/profile/skills",removeSkills);
app.post("/profile/experience",addExperience);
app.get("/skills",getDefaultSkills);

app.get("/jobs",getJobs);


export default app;