const { v2: cloudinary } = require('cloudinary');

async function uploadToCloudinary(buffer) {
    try {
        return await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: 'image' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(buffer);
        });
    } catch (e) {
        console.error('Cloudinary upload error:', e);
        throw e;
    }
}

module.exports = { uploadToCloudinary };
