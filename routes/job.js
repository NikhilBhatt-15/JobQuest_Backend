import express from "express";
import {getCompanies} from "../controllers/jobConroller.js";

const app = express.Router();

app.get("/companies",getCompanies);


export default app;