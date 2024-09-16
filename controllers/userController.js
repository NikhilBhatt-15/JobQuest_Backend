import {TryCatch} from "../middlewares/error.js";
import prisma from "../prisma/prismaClient.js";
import {ErrorHandler, uploadFilesToCloudinary} from "../utils/utility.js";

const createProfile = TryCatch(async (req, res, next) => {

    const {bio,gender,phone_no,location,} = req.body;
    const age = parseInt(req.body.age);
    console.log(req.files);
    const profileExist = await prisma.profile.findFirst({
        where:{
            userId:req.user.id
        }
    });
    if(profileExist){
        return next(new ErrorHandler("Profile already exists",400));
    }
    const result = await uploadFilesToCloudinary(req.files['avatar'][0].path);

    const user = req.user;
    const profile = await prisma.profile.create(
        {
            data:{
                userId: user.id,
                bio,
                age,
                gender,
                phone_no,
                location,
                imagePublicId: result.public_id,
                imageUrl: result.url
            }
        }
    )
    res.status(200).json({
        success: true,
        profile,
    });
});


const editProfile = TryCatch(async (req, res, next) => {

});

const getJobs = TryCatch(async (req, res, next) => {
   const jobs = await prisma.job.findMany();
    res.status(200).json({
        success: true,
        jobs
    });
});



export {createProfile,editProfile,getJobs};