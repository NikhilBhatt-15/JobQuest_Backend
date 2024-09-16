import {TryCatch} from "./error.js";
import {ErrorHandler} from "../utils/utility.js";


const employerMiddleware = TryCatch(async(req,res,next)=>{
    if(req.user.role !== "EMPLOYER"){
        return next(new ErrorHandler("Not authorized to access this route",401));
    }
    next();
});




export default employerMiddleware;