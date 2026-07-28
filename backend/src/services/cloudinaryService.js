const cloudinary = require("../config/cloudinary")

const uploadImages = async (files, folder = "products") => {
    const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder
                },
                (error, result) => {
                    if (error) {
                        return reject(error)
                    }
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id
                    })
                }
            ).end(file.buffer)

        })

    })
    return Promise.all(uploadPromises)
}

const deleteImage = async (publicId) => {
    await cloudinary.uploader.destroy(publicId)
}

const deleteImages = async (publicIds) => {
    await Promise.all(
        publicIds.map(deleteImage)
    )
}

module.exports = {
    uploadImages,
    deleteImage,
    deleteImages
}