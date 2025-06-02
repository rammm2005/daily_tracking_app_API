const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'CLOUD_NAME',
    api_key: 'API_KEY_CLOUD',
    api_secret: 'API_SECRET_CLOUD',
});

module.exports = cloudinary;
