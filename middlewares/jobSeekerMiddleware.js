import {TryCatch} from "./error.js";
import {ErrorHandler} from "../utils/utility.js";

const jobSeekerMiddleware = TryCatch(async(req,res,next)=>{
    if(req.user.role !== "JOBSEEKER"){
        return next(new ErrorHandler("Not authorized to access this route",401));
    }
});

export default jobSeekerMiddleware;