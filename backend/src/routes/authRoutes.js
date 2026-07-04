const express=require("express");
const authController=require("../controllers/authController");
const validateAllowedFields=require("../middleware/validation/validateAllowedField");
const { registerValidation, loginValidation, changePasswordValidation, updateProfileValidation }=require("../middleware/validation/authValidation");
const validate = require("../middleware/validation/validate");
const authMiddleware = require("../middleware/auth/authMiddleware");
const router=express.Router();

router.post("/register",
    validateAllowedFields(["name","email","password"]),
    registerValidation,
    validate,
    authController.register
);
router.post("/login",
    validateAllowedFields(["email","password"]),
    loginValidation,
    validate,
    authController.login
);
router.get("/me",
    authMiddleware,
    authController.getCurrentUser
)
router.patch("/change-password",
    authMiddleware,
    validateAllowedFields([
        "currentPassword",
        "newPassword"
    ]),
    changePasswordValidation,
    validate,
    authController.changePassword
)
router.patch("/profile",
    authMiddleware,
    validateAllowedFields([
        "name",
        "email"
    ]),
    updateProfileValidation,
    validate,
    authController.updateProfile
)
router.post("/logout",
    authMiddleware,
    authController.logout
)
module.exports=router