import {TryCatch} from "../middlewares/error.js";
import prisma from "../prisma/prismaClient.js";
import {ErrorHandler} from "../utils/utility.js";

const getCompanies = TryCatch(async(req,res,next)=>{
   const employers = await prisma.employer.findMany({
       select:{
              id:true,
              company:true,
              location:true,
              phone_no:true,
              website:true,
              imageUrl:true,
       }
   });

   res.status(200).json({
       success:true,
       companies:employers
   });
});

const saveJob = TryCatch(async(req,res,next)=>{
    const jobId = req.params.id
    const job = await prisma.job.findUnique(
        {
            where:{
                id:jobId
            }
        }
    )
    if(!job){
        return next( new ErrorHandler("No such Job",400))
    }

    const savedJobs = await prisma.savedJob.findMany(
        {
            where:{
                userId:req.user.id
            }
        }
    )

    const isSaved = savedJobs.some((savedJob)=>savedJob.jobId===jobId)
    if(isSaved){
        return next(new ErrorHandler("Job already saved",400))
    }
    await prisma.savedJob.create({
        data:{
            userId:req.user.id,
            jobId:jobId
        }
    })
    res.status(200).json({
        success:true,
        message:"Job saved successfully"
    })
})

const unsaveJob = TryCatch(async(req,res,next)=>{
    const jobId = req.params.id
    const job = await prisma.job.findUnique(
        {
            where:{
                id:jobId
            }
        }
    )
    if(!job){
        return next( new ErrorHandler("No such Job",400))
    }

    const savedJobs = await prisma.savedJob.findMany(
        {
            where:{
                userId:req.user.id
            }
        }
    )

    const isSaved = savedJobs.some((savedJob)=>savedJob.jobId===jobId)
    if(!isSaved){
        return next(new ErrorHandler("Job not saved",400))
    }
    await prisma.savedJob.deleteMany({
        where:{
            userId:req.user.id,
            jobId:jobId
        }
    })
    res.status(200).json({
        success:true,
        message:"Job unsaved successfully"
    })
});

const getSavedJobs = TryCatch(async(req,res,next)=>{
    const savedJobs = await prisma.savedJob.findMany({
        where:{
            userId:req.userId
        },
        select:{
            job:true
        }
    })
    const  jobs  = savedJobs.map((savedJob)=>savedJob.job)
    const promises = jobs.map(async(job)=> {
        const employer = await prisma.employer.findUnique({
            where: {
                id: job.employerId
            },
            select: {
                company: true,
                location: true,
                phone_no: true,
                website: true,
                imageUrl: true
            }
        });
        job["company_name"] = employer.company;
        job["company_location"] = employer.location;
        job["company_phone_no"] = employer.phone_no;
        job["company_website"] = employer.website;
        job["company_imageUrl"] = employer.imageUrl;
        job["isBookmarked"] = true;
        delete job.employerId;
        return job;

    });
    await Promise.all(promises);
    res.status(200).json({
        success:true,
        jobs
    })
})

export {getCompanies,saveJob,unsaveJob,getSavedJobs}