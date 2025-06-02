const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload buffer file ke Cloudinary dengan stream.
 * @param {Buffer} buffer - file buffer dari multer memory storage
 * @param {string} folder - folder tujuan di Cloudinary (opsional)
 * @returns {Promise<Object>} - hasil upload Cloudinary (detail url dll)
 */
function uploadStreamToCloudinary(buffer, folder = 'tips') {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        const readable = new Readable();
        readable._read = () => { };
        readable.push(buffer);
        readable.push(null);
        readable.pipe(stream);
    });
}

module.exports = { uploadStreamToCloudinary };
