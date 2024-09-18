import prisma from "../prisma/prismaClient.js";
import {TryCatch} from "../middlewares/error.js";
import {deleteFilesFromCloudinary, emailValidator, ErrorHandler, passwordValidator} from "../utils/utility.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



const registerAdmin = TryCatch(async (req, res) => {
    const {firstName,lastName,email,password} = req.body;
    if (!email || !password || !firstName || !lastName) {
        throw new ErrorHandler("Please enter email and password",400);
    }
    if(firstName.length<3 || firstName.length>20){
        throw new ErrorHandler("First name must be between 3 to 20 characters",400);
    }
    if(lastName.length<3 || lastName.length>20){
        throw new ErrorHandler("Last name must be between 3 to 20 characters",400);
    }
    if(!passwordValidator(password)){
        throw new ErrorHandler("Password must be 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter",400);
    }

    if(!emailValidator(email)){
        throw new ErrorHandler("Email is not valid",400);
    }

    const adminExists = await prisma.user.findUnique({
        where: {
            email: email,
            role: "ADMIN"
        }
    });
    if (adminExists) {
        throw new ErrorHandler("Admin already exists",400);
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.user.create({
        data: {
            email,
            password: encryptedPassword,
            firstName,
            lastName,
            role: "ADMIN"
        }
    });
    res.status(201).json({
        success: true,
        admin,
        message: "Admin created successfully"
    });

});

const loginAdmin = TryCatch(async (req, res) => {
    const {email,password} = req.body;
    if (!email || !password) {
        throw new ErrorHandler("Please enter email and password",400);
    }
    const admin = await prisma.user.findUnique({
        where: {
            email: email,
            role: "ADMIN"
        }
    });
    if (!admin) {
        throw new ErrorHandler("Invalid credentials",401);
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        throw new ErrorHandler("Invalid credentials",401);
    }
    const token = jwt.sign({id: admin.id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE||"1d"
    });
    res.status(200).json({
        success: true,
        admin,
        token,
        message: "Admin logged in successfully"
    });

});

const allUsers = TryCatch(async (req,res)=>{
    const users = await prisma.user.findMany({
        where:{
            role:"JOBSEEKER"
        }
    });
    res.status(200).json({
        success:true,
        users
    });
});

const allEmployers = TryCatch(async (req,res)=>{
    const employers = await prisma.user.findMany({
        where:{
            role:"EMPLOYER"
        }
    });
    res.status(200).json({
        success:true,
        employers
    });
});

const jobs = TryCatch(async (req,res)=>{
    const jobs = await prisma.job.findMany();
    res.status(200).json({
        success:true,
        jobs
    });
});

const addSkills = TryCatch(async (req,res)=>{
    const {skills} = req.body;
    if(!skills){
        throw new ErrorHandler("Please enter skills",400);
    }
    const promises = skills.map(async skill=>{
        const skillExists = await prisma.skill.findUnique({
            where:{
                name:skill
            }
        });
        if(skillExists){
            return;
        }
        return  prisma.skill.create({
            data:{
                name:skill,
                status:"ACTIVE"
            }
        });
    });
    await Promise.all(promises);

    res.status(200).json({
        success:true,
        message:"Skill added successfully"
    });
});

const removeSkills = TryCatch(async (req,res)=>{
    const {skills} = req.body;
    if(!skills){
        throw new ErrorHandler("Please enter skills",400);
    }
    const promises = skills.map(async skill=>{
        const skillExists = await prisma.skill.findUnique({
            where:{
                name:skill
            }
        });
        if(!skillExists){
            return;
        }
        return  prisma.skill.delete({
            where:{
                name:skill
            }
        });
    });
    await Promise.all(promises);

    res.status(200).json({
        success:true,
        message:"Skill removed successfully"
    });
});

const activateSkill= TryCatch(async (req,res)=>{
    const {skills} = req.body;
    if(!skills){
        throw new ErrorHandler("Please enter skill",400);
    }
    const promises = skills.map(async skill=>{
        const skillExists = await prisma.skill.findUnique({
            where:{
                name:skill
            }
        });
        if(!skillExists){
            return;
        }
        return  prisma.skill.update({
            where:{
                name:skill
            },
            data:{
                status:"ACTIVE"
            }
        });
    });
    res.status(200).json({
        success:true,
        message:"Skill activated successfully"
    });
});


const deactivateSkill= TryCatch(async (req,res)=> {
    const {skills} = req.body;
    if (!skills) {
        throw new ErrorHandler("Please enter skill", 400);
    }
    const promises = skills.map(async skill => {
        const skillExists = await prisma.skill.findUnique({
            where: {
                name: skill
            }
        });
        if (!skillExists) {
            return;
        }
        return prisma.skill.update({
            where: {
                name: skill
            },
            data: {
                status: "INACTIVE"
            }
        });
    });
    res.status(200).json({
        success: true,
        message: "Skill deactivated successfully"
    });

});
const getSkills = TryCatch(async (req,res)=>{
    const status = req.query.status;

    if(status && (status === "ACTIVE" || status === "INACTIVE")){
        const skills = await prisma.skill.findMany({
            where: {
                status
            }
        });
        res.status(200).json({
            success: true,
            skills
        });
    }
    const skills = await prisma.skill.findMany();
    res.status(200).json({
        success:true,
        skills
    });
});

const removeUser = TryCatch(async (req,res)=>{
    const userId = req.params.id;
    const user = await prisma.user.findUnique({
        where:{
            id:userId
        }
    });
    if(!user){
        throw new ErrorHandler("User not found",404);
    }
    const profile = await prisma.profile.findUnique({
        where: {
            userId: userId
        }
    });
    const imagePublicId = profile.imagePublicId;
    const resumePublicId = profile.resumePublicId;
    if(imagePublicId){
        await deleteFilesFromCloudinary(imagePublicId);
    }
    if(resumePublicId){
        await deleteFilesFromCloudinary(resumePublicId);
    }
    await prisma.user.delete({
        where:{
            id:userId
        }
    });
    res.status(200).json({
        success:true,
        message:"User removed successfully"
    });
});

const removeEmployer= TryCatch(async (req,res)=>{
   const employerId = req.params.id;
   const employer = await prisma.user.findUnique({
       where:{
           id:employerId
       }
   });
    if(!employer){
         throw new ErrorHandler("Employer not found",404);
    }
    const employerProfile = await prisma.employer.findUnique({
         where:{
              userId:employerId
         }
    });
    const imagePublicId = employerProfile.imagePublicId;
    if(imagePublicId){
         await deleteFilesFromCloudinary(imagePublicId);
    }
     await prisma.user.delete({
          where:{
                id:employerId
          }
     });
     res.status(200).json({
          success:true,
          message:"Employer removed successfully"
     });

});

const deleteJob  = TryCatch(async (req,res,next)=>{
   const jobId = req.params.id;
    const job = await prisma.job.findUnique({
         where:{
              id:jobId
         }
    });
    if(!job){
         return next(new ErrorHandler("Job not found",404));
    }
    await prisma.job.delete({
        where:{
            id:jobId
        }
    });

    res.status(200).json({
        success:true,
        message:"Job removed successfully"
    });

});


export {registerAdmin,
    loginAdmin,
    allUsers,
    allEmployers,
    jobs,
    addSkills,
    removeSkills,
    activateSkill,
    deactivateSkill,
    getSkills,
    removeUser,
    removeEmployer,
    deleteJob
};