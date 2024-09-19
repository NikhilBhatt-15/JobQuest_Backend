import {TryCatch} from "../middlewares/error.js";
import prisma from "../prisma/prismaClient.js";
import {ErrorHandler} from "../utils/utility.js";
const setFcmToken = TryCatch(async(req,res,next)=>{
   const {token} = req.body;
    if(!token){
         return next(new ErrorHandler("Please provide a token",400));
    }
    const fcmTokenExist = await prisma.fcmToken.findFirst({
        where:{
            token:token
        }
    });
    if(fcmTokenExist){

        const newFcmToken = await prisma.fcmToken.update({
            where:{
                token:token
            },
            data:{
                userId:req.user.id
            }
        });

        return res.status(200).json({
            success:true,
            message:"Fcm token updated successfully"
        });
    }
    const fcmToken = await prisma.fcmToken.create({
        data:{
            token,
            userId:req.user.id
        }
    });

    res.status(200).json({
        success:true,
        message:"Fcm token created successfully"
    });
});

const getFcmToken = TryCatch(async(req,res,next)=>{
    const fcmToken = await prisma.fcmToken.findMany({
        where:{
            userId:req.user.id
        }
    });
    if(!fcmToken){
        return next(new ErrorHandler("No token found",404));
    }
    res.status(200).json({
        success:true,
        fcmToken
    });
});

const removeFcmToken = TryCatch(async(req,res,next)=>{
    const {token} = req.body;
    if(!token){
        return next(new ErrorHandler("Please provide a token",400));
    }
    const fcmToken = await prisma.fcmToken.findFirst({
        where:{
            token:token
        }
    });
    if(!fcmToken){
        return next(new ErrorHandler("No token found",404));
    }
    await prisma.fcmToken.delete({
        where:{
            token:token
        }
    });
    res.status(200).json({
        success:true,
        message:"Token deleted successfully"
    });
})

export {setFcmToken,getFcmToken,removeFcmToken};