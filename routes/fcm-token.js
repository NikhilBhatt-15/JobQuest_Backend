import express from "express";
import {getFcmToken, removeFcmToken, setFcmToken} from "../controllers/fcm-tokenController.js";

const app  = express.Router();

app.post("/fcm-token",setFcmToken);
app.get("/fcm-token",getFcmToken);
app.delete("/fcm-token",removeFcmToken);

export default app;