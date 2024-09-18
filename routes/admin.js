import express from "express";
import {
    activateSkill,
    allEmployers,
    allUsers, deactivateSkill, deleteJob, getSkills,
    jobs,
    addSkills,
    loginAdmin,
    registerAdmin, removeEmployer,
    removeSkills, removeUser
} from "../controllers/adminController.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const app = express.Router();

app.post("/register",registerAdmin);
app.post("/login",loginAdmin);

app.use(authMiddleware);
app.use(adminMiddleware);

app.get("/users",allUsers);
app.get("/employers",allEmployers);
app.get("/jobs",jobs);

// Skills
app.post("/skills",addSkills);
app.delete("/skills",removeSkills);
app.post("/skills/activate",activateSkill);
app.post("/skills/deactivate",deactivateSkill);
app.get("/skills",getSkills);

app.delete("/employer/:id",removeEmployer);
app.delete("/job/:id",deleteJob);
app.delete("/user/:id",removeUser);



export default app;