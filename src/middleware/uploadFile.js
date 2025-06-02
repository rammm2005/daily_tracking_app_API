const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

function uploadFile(folderName = 'uploads') {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: folderName,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        },
    });

    return multer({ storage });
}

module.exports = uploadFile;
