const multer = require("multer");
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const AppError = require("../utils/AppError");

// STEP 1 - CONFIFURE STORAGE DESINATION
const storage =  new CloudinaryStorage({
    cloudinary : cloudinary,

    params : {
        folder : "user-photos",
        allowed_formats : ["jpg" , "jpeg" , "png" , "webp"],

        tranformation : [
            {width : 500 , height : 500 , crop: "fill"}
        ],

        public_id : (req , file) => {
            return `user-${req.user.id}-${Date.now()}`;
        }
    }

});

// step 2 -FILE FILTER EXTRA VALIDATION
const fileFilter = (req, file , cb) => {
    // file.mimetype = "image/jpeg" etc
    if(file.mimetype.startsWith("image")) {
        cb(null , true);
    } else {
        cb(new AppError("Please upload only images" , 400) , false);
    }
}

// step 3 create multer instance
const upload = multer({
    storage : storage,
    fileFilter : fileFilter,
    limits : {
        fileSize : 5 * 1024 * 1024 // 5 mb in bytes
    }
})

module.exports = upload;