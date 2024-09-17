import express from "express";
import employerMiddleware from "../middlewares/employerMiddleware.js";
import {singleUpload} from "../middlewares/multer.js";
import {createEmployer, deleteJob, getEmployer, getPostedJobs, postJobs,} from "../controllers/employerController.js";

const app = express.Router();

app.use(employerMiddleware);
app.post("/profile",singleUpload,createEmployer);
app.put("/profile",singleUpload,createEmployer);
app.get("/profile",getEmployer);
app.get("/jobs",getPostedJobs);
app.post("/jobs",postJobs);
app.delete("/jobs/:id",deleteJob);

export default app;