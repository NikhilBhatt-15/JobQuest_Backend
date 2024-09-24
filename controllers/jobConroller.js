import {TryCatch} from "../middlewares/error.js";
import prisma from "../prisma/prismaClient.js";

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

export {getCompanies}