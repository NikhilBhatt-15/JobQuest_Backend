import multer from 'multer';

// files size limit is 5mb
const upload = multer({
    dest:"uploads/",
    limits:{
        fileSize:1024*1024*100
    },
})

export const pfUpload = upload.fields([{name:'avatar',maxCount:1},{name:'resume',maxCount:1}]);
export const singleUpload =upload.single('avatar',1);
export const resumeUpload = upload.single('resume',1);
