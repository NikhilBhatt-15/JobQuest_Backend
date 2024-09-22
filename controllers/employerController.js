import {TryCatch} from "../middlewares/error.js";
import {deleteFilesFromCloudinary, ErrorHandler, uploadFilesToCloudinary} from "../utils/utility.js";
import prisma from "../prisma/prismaClient.js";

const createEmployer = TryCatch(async(req,res,next)=>{
    const {company,location,phone_no,website} = req.body;
    const employerExist = await prisma.employer.findFirst({
        where:{
            userId:req.user.id
        }
    });
    const result = req.file? await uploadFilesToCloudinary(req.file.path):null;

    if(employerExist){
        if(result && result.public_id && employerExist.imagePublicId){
            await deleteFilesFromCloudinary(employerExist.imagePublicId);
        }
        const newEmployer = await prisma.employer.update({
            where:{
                userId:req.user.id
            },
            data:{
                company:company?company:employerExist.company,
                location:location?location:employerExist.location,
                phone_no:phone_no?phone_no:employerExist.phone_no,
                website:website?website:employerExist.website,
                imagePublicId: result?(result.public_id?result.public_id:employerExist.imagePublicId):employerExist.imagePublicId,
                imageUrl: result?(result.url?result.url:employerExist.imageUrl):employerExist.imageUrl
            }
        });
        return res.status(200).json({
            success:true,
            employer:newEmployer,
            message:"Employer updated successfully"
        });
    }

    const user = req.user;
    const employer = await prisma.employer.create(
        {
            data:{
                userId: user.id,
                company,
                location,
                phone_no,
                website,
                imagePublicId: result? result.public_id:null,
                imageUrl: result? result.url:null
            }
        }
    )
    res.status(200).json({
        success: true,
        employer,
        message:"Employer created successfully"
    });
})

const getEmployer = TryCatch(async(req,res,next)=> {
    const employer = await prisma.employer.findFirst({
        where: {
            userId: req.user.id
        }
    });
    if (!employer) {
        return next(new ErrorHandler("Profile not found", 400));
    }
    res.status(200).json({
        success: true,
        employer
    });
});

const postJobs = TryCatch(async (req,res,next)=>{
    const {title,description,location,jobType,category,salary} = req.body;
    if(!title || !description || !location || !jobType || !category || !salary ){
        return next(new ErrorHandler("All fields are required",400));
    }

    const job = await prisma.job.create({
        data:{
            title,
            description,
            location,
            jobType,
            jobLocation:category,
            salary,
            employerId:req.user.employer.id
        }
    });
    res.status(200).json({
        success:true,
        job,
        message:"Job posted successfully"
    });
});

const getPostedJobs = TryCatch(async (req,res,next)=>{

    const jobs = await prisma.job.findMany({
        where:{
            employerId:req.user.employer.id
        }
    });
    res.status(200).json({
        success:true,
        jobs
    });
});

const deleteJob = TryCatch(async (req,res,next)=>{

    const job = await prisma.job.findUnique({
        where:{
            id:req.params.id
        }
    });
    if(!job){
        return next(new ErrorHandler("Job not found",400));
    }
    if(job.employerId !== req.user.employer.id){
        return next(new ErrorHandler("Not authorized to delete job",401));
    }
    await prisma.job.delete({
        where:{
            id:req.params.id
        }
    });
    res.status(200).json({
        success:true,
        message:"Job deleted successfully"
    });

});

export {createEmployer,postJobs,getPostedJobs,deleteJob,getEmployer};