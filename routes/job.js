import express from "express";
import {getCompanies, getSavedJobs, saveJob, unsaveJob} from "../controllers/jobConroller.js";

const app = express.Router();

app.get("/companies",getCompanies);

app.put("/save/:id",saveJob);
app.put("/unsave/:id",unsaveJob);
app.get("/saved",getSavedJobs);
export default app;