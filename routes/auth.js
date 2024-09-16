import express from "express";

import {allUsers, login, logout, profile, register} from "../controllers/authController.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register",register);
router.post("/login",login);

// require auth middleware

router.use(authMiddleware);
router.get("/profile",profile);
router.get("/logout",logout);
router.get("/all",allUsers);


export default router;