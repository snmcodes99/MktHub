const express = require("express");
const authController = require("../controllers/authController");
const validateAllowedFields = require("../middleware/validation/validateAllowedField");
const { registerValidation, loginValidation, changePasswordValidation, updateProfileValidation, forgotPasswordValidation, resetPasswordValidation } = require("../middleware/validation/authValidation");
const validate = require("../middleware/validation/validate");
const authMiddleware = require("../middleware/auth/authMiddleware");
const router = express.Router();

router.post("/register",
    validateAllowedFields(["name", "email", "password"]),
    registerValidation,
    validate,
    authController.register
);
router.post("/login",
    validateAllowedFields(["email", "password"]),
    loginValidation,
    validate,
    authController.login
);

router.post("/refresh", authController.refresh)

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
router.patch("/update-profile",
    authMiddleware,
    validateAllowedFields([
        "name"
    ]),
    updateProfileValidation,
    validate,
    authController.updateProfile
)
router.post(
    "/logout-all",
    authMiddleware,
    authController.logoutAllDevices
)
router.post(
    "/forgot-password",
    validateAllowedFields(["email"]),
    forgotPasswordValidation,
    validate,
    authController.forgotPassword
)
router.post(
    "/reset-password/:token",
    validateAllowedFields(["newPassword"]),
    resetPasswordValidation,
    validate,
    authController.resetPassword
)
router.post(
    "/resend-verification",
    validateAllowedFields(["email"]),
    forgotPasswordValidation,
    validate,
    authController.resendVerificationEmail
)
router.post("/logout", authController.logout)
router.get("/verify-email/:token", authController.verifyEmail)
module.exports = router