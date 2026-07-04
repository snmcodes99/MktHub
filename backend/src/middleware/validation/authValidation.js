const {body}=require("express-validator")
const registerValidation=[
    body("name").trim().notEmpty().withMessage("Name is Required").bail().isLength({max:50}).withMessage("Name can not exceed 50 letters"),
    body("email").trim().notEmpty().withMessage("email is requried").bail().isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required").bail().isLength({min:6}).withMessage("password must be at least 6 character"),
]

const loginValidation=[
    body("email").trim().notEmpty().withMessage("email is requried").bail().isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required").bail().isLength({min:6}).withMessage("password must be at least 6 character"),
]

const changePasswordValidation=[
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .bail()
        .isLength({min:6})
        .withMessage("Password must be at least 6 characters")
]

const updateProfileValidation=[
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty").bail().isLength({max:50}).withMessage("Name can not exceed 50 letters"),
    body("email").optional().trim().notEmpty().withMessage("email cannot be empty").bail().isEmail().withMessage("Invalid email format"),
]

module.exports={
    registerValidation,
    loginValidation,
    changePasswordValidation,
    updateProfileValidation
}