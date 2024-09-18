import {TryCatch} from "./error.js";
import {ErrorHandler} from "../utils/utility.js";


const adminMiddleware = TryCatch(async(req,res,next)=>{

    if(req.user.role !== "ADMIN"){
        return next(new ErrorHandler("Not authorized to access this route",401));
    }
    next();
});

export default adminMiddleware;