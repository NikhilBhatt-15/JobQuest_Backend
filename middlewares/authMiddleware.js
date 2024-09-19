import {TryCatch} from "./error.js";
import jwt from "jsonwebtoken";
import {ErrorHandler} from "../utils/utility.js";
import prisma from "../prisma/prismaClient.js";

const getTokenFromHeader = (req) => {
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
        // Split 'Bearer ' from the token
        return authHeader.split(' ')[1];
    } else {
        return null; // Return null if no token is found
    }
}


const authMiddleware = TryCatch(async (req, res, next) => {
    // Get the token from the header  Authorization Bearer

    const token = getTokenFromHeader(req);

    // Check if no token
    if (!token) {
        return next(new ErrorHandler("No token, authorization denied", 401));
    }
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(!decoded){
        return next(new ErrorHandler("Invalid token",401));
    }
    const user = await prisma.user.findUnique({
        where: {
            id: decoded.id
        }
    });
    if (!user) {
        return next(new ErrorHandler("User not found", 400));
    }
    const {password,createdAt,updatedAt, ...rest} = user;
    req.user = rest;
    next();
});

export {authMiddleware};