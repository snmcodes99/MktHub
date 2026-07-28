const { v2: cloudinary } = require("cloudinary");

if (process.env.CLOUDINARY_URL) {
    const url = process.env.CLOUDINARY_URL.trim();
    const regex = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/;
    const match = url.match(regex);
    if (match) {
        cloudinary.config({
            api_key: match[1],
            api_secret: match[2],
            cloud_name: match[3],
            secure: true
        });
    } else {
        cloudinary.config(true); // Fallback
    }
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
}

module.exports = cloudinary;