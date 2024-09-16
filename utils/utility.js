import {v2} from 'cloudinary';
v2.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
)
class ErrorHandler extends Error {
    constructor(message,statusCode) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}
const uploadFilesToCloudinary = async (file) => {
    const result  = await v2.uploader.upload(file, {
        folder: "social-media-app"
    });

    return {
        public_id:result.public_id,
        url:result.secure_url
    }

}
const deleteFilesFromCloudinary = async (file) => {
    await v2.uploader.destroy(file);
}
const passwordValidator = (password) => {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    return re.test(password);
}
const emailValidator = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}
export { ErrorHandler,passwordValidator,emailValidator,uploadFilesToCloudinary,deleteFilesFromCloudinary};