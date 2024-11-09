import {TryCatch} from "../middlewares/error.js";
import prisma from "../prisma/prismaClient.js";
import {deleteFilesFromCloudinary, ErrorHandler, uploadFilesToCloudinary} from "../utils/utility.js";

const createProfile = TryCatch(async (req, res, next) => {

    const {bio,gender,phone_no,location} = req.body;
    const age = parseInt(req.body.age);
    const profileExist = await prisma.profile.findFirst({
        where:{
            userId:req.user.id
        }
    });
    const result = req.file?await uploadFilesToCloudinary(req.file.path):{public_id:null,url:null};

    if(profileExist){
        const newProfile = await prisma.profile.update({
            where:{
                userId:req.user.id
            },
            data:{
                bio:bio?bio:profileExist.bio,
                age:age?age:profileExist.age,
                gender:gender?gender:profileExist.gender,
                phone_no:phone_no?phone_no:profileExist.phone_no,
                location:location?location:profileExist.location,
                imagePublicId:result.public_id?result.public_id:profileExist.imagePublicId,
                imageUrl:result.url?result.url:profileExist.imageUrl
            }

        });

        return res.status(200).json({
            success:true,
            profile:newProfile,
            message:"Profile updated successfully"
        });
    }

    const profile = await prisma.profile.create(
        {
            data:{
                userId: req.user.id,
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
        message: "Profile created successfully"
    });
});

const getJobs = TryCatch(async (req, res, next) => {
   const jobs = await prisma.job.findMany(
   );
   const savedJobs = await prisma.savedJob.findMany({
         where:{
              userId:req.user.id
         }
    });

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
               imageUrl: true,
           }
       });
       const isSaved = savedJobs.some((savedJob)=>savedJob.jobId===job.id);
       job["company_name"] = employer.company;
       job["company_location"] = employer.location;
       job["company_phone_no"] = employer.phone_no;
       job["company_website"] = employer.website;
       job["company_imageUrl"] = employer.imageUrl;
       job["isBookmarked"] = isSaved;
       delete job.employerId;
       return job;

   });
    await Promise.all(promises);
    res.status(200).json({
        success: true,
        jobs
    });
});

const getProfile = TryCatch(async (req, res, next) => {
    // add resume url to the profile
    // add education to the profile
    // add experience to the profile
    // add skills to the profile
    // add the user to the profile
    // only show bio,age,gender,phone_no,location,imageUrl
    // only include the image url
    // only include the user email,firstname,lastname
    // only include the education school,degree,field,from,to
    // only include the experience company,position,from,to
    // return the profile

    const profile = await prisma.profile.findUnique({
        where:{
            userId:req.user.id
        },
        include:{
            education:{
                select:{
                    school:true,
                    degree:true,
                    field:true,
                    from:true,
                    to:true
                }
            },
            experience:{
                select:{
                    title:true,
                    company:true,
                    location:true,
                    description:true,
                    from:true,
                    to:true
                }
            }
        }
    });
    if (!profile) {
        return next(new ErrorHandler("Profile not found", 400));
    }
    // only show bio,age,gender,phone_no,location,imageUrl
    const newProfile = {...profile};
    delete newProfile.id;
    delete newProfile.userId;
    delete newProfile.createdAt;
    delete newProfile.updatedAt;
    delete newProfile.imagePublicId;
    delete newProfile.resumePublicId;
    const skills = await prisma.profileSkill.findMany({
        where:{
            profileId:profile.id
        },
        include:{
            skill:true
        }
    });

    newProfile["email"]=req.user.email;
    newProfile["firstname"]=req.user.firstName;
    newProfile["lastname"]=req.user.lastName;
    newProfile["skills"]=skills.map((skill)=>skill.skill.name);
    res.status(200).json({
        success: true,
        profile:newProfile
    });

});

const addResume = TryCatch(async (req, res, next) => {

    if(!req.file){
        return next(new ErrorHandler("Please upload a file",400));
    }
    const profile = await prisma.profile.findUnique({
        where:{
            userId:req.user.id
        }
    });
    if(!profile){
        return next(new ErrorHandler("Profile not found",400));
    }
    if(profile.resumePublicId)await deleteFilesFromCloudinary(profile.resumePublicId);
    const result = await uploadFilesToCloudinary(req.file.path);
    const newProfile = await prisma.profile.update({
        where:{
            userId:req.user.id
        },
        data:{
            resumePublicId:result.public_id,
            resumeUrl:result.url
        }
    });

    res.status(200).json({
        success:true,
        newProfile,
        message:"Resume uploaded successfully"
    });

});

const addEducation = TryCatch(async (req, res, next) => {
    const {education} = req.body;
    const profile = await prisma.profile.findUnique({
        where:{
            userId:req.user.id
        }
    });
    if(!profile){
        return next(new ErrorHandler("Profile not found",400));
    }
//     education is an array of objects
//     each object has school,degree,field,from,to
    const promises = education.map(async (edu)=> {
        return prisma.education.create({
            data: {
                school: edu.school,
                degree: edu.degree,
                field: edu.field,
                from: edu.from,
                to: edu.to?edu.to:null,
                profileId: profile.id
            }
        });
    }
    );
    await Promise.all(promises);
    res.status(200).json({
        success:true,
        message:"Education added successfully"
    });
});

const addSkills = TryCatch(async (req, res, next) => {
    const {skills} = req.body;
    const profile = await prisma.profile.findUnique({
        where:{
            userId:req.user.id
        }
    });
    if(!profile){
        return next(new ErrorHandler("Profile not found",400));
    }
    const promises = skills.map(async (skill)=>{
        const skillExist = await prisma.skill.findFirst({
            where:{
                name:skill.toUpperCase(),
            }
        });
        if(skillExist){
            const profileSkill = await prisma.profileSkill.findFirst({
                where:{
                    profileId:profile.id,
                    skillId:skillExist.id
                }
            });
            if(profileSkill){
                return;
            }
            return prisma.profileSkill.create({
                data:{
                    profileId:profile.id,
                    skillId:skillExist.id
                }
            });
        }
        const newSkill = await prisma.skill.create({
            data:{
                name:skill.toUpperCase(),
                status:"INACTIVE"
            }
        });
        return prisma.profileSkill.create({
            data:{
                profileId:profile.id,
                skillId:newSkill.id
            }
        });
    });
    await Promise.all(promises);
    res.status(200).json({
        success:true,
        message:"Skills added successfully"
    });
});

const removeSkills = TryCatch(async (req, res, next) => {
    const {skills} = req.body;
    const profile = await prisma.profile.findUnique({
        where:{
            userId:req.user.id
        }
    });
    if(!profile){
        return next(new ErrorHandler("Profile not found",400));
    }
    const promises = skills.map(async (skill)=>{
        const skillExist = await prisma.skill.findFirst({
            where:{
                name:skill.toUpperCase(),
            }
        });
        if(skillExist) {
            const profileSkillExist = await prisma.profileSkill.findFirst({
                where: {
                        profileId: profile.id,
                        skillId: skillExist.id
                }
            });
            if (!profileSkillExist) {
                return null;
            }
            return prisma.profileSkill.delete({
                where: {
                    profileId_skillId: {
                        profileId: profile.id,
                        skillId: skillExist.id
                    }
                }
            });
        }
        return null;
    });
    await Promise.all(promises);

    res.status(200).json({
        success:true,
        message:"Skills removed successfully"
    });
});

const addExperience = TryCatch(async (req, res, next) => {
    const {experience} = req.body;
    const profile = await prisma.profile.findUnique({
        where: {
            userId: req.user.id
        }
    });
    if (!profile) {
        return next(new ErrorHandler("Profile not found", 400));
    }
    const promises = experience.map(async(exp)=>{
        return prisma.experience.create({
            data:{
                title:exp.title,
                company:exp.company,
                location:exp.location,
                from:exp.from,
                to:exp.to?exp.to:null,
                description:exp.description?exp.description:null,
                profileId:profile.id
            }
        })
    })
    await Promise.all(promises);
    res.status(200).json({
        success:true,
        message:"Experience added successfully"
    });
});

const getDefaultSkills = TryCatch(async (req, res, next) => {
    const skills = await prisma.skill.findMany();
    res.status(200).json({
        success:true,
        skills
    });
});

export {createProfile,getJobs,getProfile,addSkills,addResume,addEducation,removeSkills,addExperience,getDefaultSkills};