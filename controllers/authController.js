import prisma from "../prisma/prismaClient.js";
import bcrypt from 'bcrypt';
import {TryCatch} from "../middlewares/error.js";
import {emailValidator, ErrorHandler, passwordValidator} from "../utils/utility.js";
import jwt from "jsonwebtoken";


const register = TryCatch(async (req, res) => {
    const {firstName,lastName,email,password} = req.body;
    if (!firstName || !lastName || !email || !password ) {
        throw new ErrorHandler("All fields are required",400 );
    }
    if (!passwordValidator(password)) {
        throw new ErrorHandler("Password must be 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter",422);
    }
    if (!emailValidator(email)) {
        throw new ErrorHandler( "Email is not valid",422);
    }
    if(firstName.length<3 || firstName.length>20){
        throw new ErrorHandler("First name must be between 3 to 20 characters",422);
    }
    if(lastName.length<3 || lastName.length>20){
        throw new ErrorHandler("Last name must be between 3 to 20 characters",422);
    }
    const userExists = await prisma.user.findUnique({
        where: {
            email: email
        }
    });
    if (userExists) {
        throw new ErrorHandler( "User already exists",400);
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: encryptedPassword,
            role: req.body.role || "JOBSEEKER"
        }
    });
    const {password:userPassword, role, ...userWithoutPasswordAndRole} = user;
    res.status(201).json({
            success: true,
            user: userWithoutPasswordAndRole,
            message: "User created successfully"
    });
})

const login = TryCatch(async (req, res) => {
    const {email,password} = req.body;
    if (!email || !password) {
        throw new ErrorHandler("Please enter email and password",400);
    }
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });
    if (!user) {
        throw new ErrorHandler("Invalid credentials",401);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ErrorHandler("Invalid credentials",401);
    }
    const token = jwt.sign({id:user.id},process.env.JWT_SECRET,{
        expiresIn: 1000*60*60*24
    });
    res.status(200).json({
        success: true,
        user,
        token,
        message: "User logged in successfully"
    });
});

const logout = TryCatch(async (req, res) => {
//             expire token

});

const profile = TryCatch(async (req, res) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user
    });
});

const allUsers = TryCatch(async(req,res,next)=>{
    const users = await prisma.test.findMany();
    res.status(200).json({
        success:true,
        users
    });
})




export {register,allUsers,login,logout,profile};