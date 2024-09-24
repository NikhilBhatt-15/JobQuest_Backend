import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import auth from "./routes/auth.js";
import {errorMiddleware} from "./middlewares/error.js";
import user from "./routes/user.js";
import {authMiddleware} from "./middlewares/authMiddleware.js";
import employer from "./routes/employer.js";
import admin from "./routes/admin.js";
import fcmToken from "./routes/fcm-token.js";
import job from "./routes/job.js";

dotenv.config({
    path:"./.env"
});

const app = express();
const PORT = process.env.PORT||5000;

// Middlewares
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/v1/auth",auth);
app.use("/api/v1/admin",admin);

app.use(authMiddleware);
app.use("/api/v1/jobs",job);
app.use("/api/v1",fcmToken);
app.use("/api/v1/user",user);
app.use("/api/v1/employer",employer);


app.use(errorMiddleware);
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});