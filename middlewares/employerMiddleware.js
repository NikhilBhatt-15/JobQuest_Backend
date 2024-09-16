import {TryCatch} from "./error.js";
import {ErrorHandler} from "../utils/utility.js";
import prisma from "../prisma/prismaClient.js";

const employerMiddleware = TryCatch(async(req,res,next)=>{
    if(req.user.role !== "EMPLOYER"){
        return next(new ErrorHandler("Not authorized to access this route",401));
    }
    req.user["employer"] = await prisma.employer.findUnique({
        where:{
            userId:req.user.id
        }
    });
    next();
});




export default employerMiddleware;