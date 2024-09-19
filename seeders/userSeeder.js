import prisma from "../prisma/prismaClient.js";
import {faker} from "@faker-js/faker";
const createUser = async (numUsers)=>{
    try {
        const usersPromise=[];
        for(let i=0;i<numUsers;i++){
            const promise = async ()=>{
                const tempUser =prisma.user.create({
                    data:{
                        firstName:faker.person.firstName(),
                        lastName:faker.person.lastName(),
                        email:faker.internet.email(),
                        password:"123456789",
                    }
                });
                const tempProfile = prisma.profile.create({
                    data:{
                        userId:tempUser.id,
                        bio:faker.lorem.sentence(),
                        age:faker.number.int({min:18,max:60}),
                        gender:faker.person.gender(),
                        phone_no:faker.phone.number(),
                        location:faker.location.streetAddress({useFullAddress:true}),

                    }
                });
            }
            usersPromise.push(promise);
        }
        await Promise.all(usersPromise);
        console.log("Users created");
        process.exit(1);
    }
    catch (e) {
        console.log(e);
        process.exit(1);
    }
}

export {createUser};