const express = require("express");
const authController = require("../controllers/authController");
const validateAllowedFields = require("../middleware/validation/validateAllowedField");
const { registerValidation, loginValidation, changePasswordValidation, updateProfileValidation, forgotPasswordValidation, resetPasswordValidation } = require("../middleware/validation/authValidation");
const validate = require("../middleware/validation/validate");
const authMiddleware = require("../middleware/auth/authMiddleware");
const createRateLimiter = require("../middleware/rateLimit/createRateLimiter")
const router = express.Router();

router.post("/register",
    createRateLimiter(
        60 * 60 * 1000,
        5,
        "Too many register attempts. Please try again after 1 hour."
    ),
    validateAllowedFields(["name", "email", "password"]),
    registerValidation,
    validate,
    authController.register
);
router.post("/login",
    createRateLimiter(
        15 * 60 * 1000,
        10,
        "Too many login attempts. Please try again after 15 minutes."
    ),
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
    createRateLimiter(
        60 * 60 * 1000,
        5,
        "Too many password change attempts. Please try again after 1 hour."
    ),
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
    createRateLimiter(
        15 * 60 * 1000,
        30,
        "Too many profile update attempts. Please try again after 15 minutes."
    ),
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
    createRateLimiter(
        60 * 60 * 1000,
        5,
        "Too many logout all attempts. Please try again after 1 hour."
    ),
    authMiddleware,
    authController.logoutAllDevices
)
router.post(
    "/forgot-password",
    createRateLimiter(
        60 * 60 * 1000,
        5,
        "Too many login attempts. Please try again after 1 hour."
    ),
    validateAllowedFields(["email"]),
    forgotPasswordValidation,
    validate,
    authController.forgotPassword
)
router.post("/reset-password/:token",
    validateAllowedFields(["newPassword"]),
    resetPasswordValidation,
    validate,
    authController.resetPassword
)
router.post("/resend-verification",
    createRateLimiter(
        60 * 60 * 1000,
        10,
        "Too many login attempts. Please try again after 1 hour."
    ),
    validateAllowedFields(["email"]),
    forgotPasswordValidation,
    validate,
    authController.resendVerificationEmail
)
router.post("/logout", authController.logout)
router.get("/verify-email/:token", authController.verifyEmail)
router.get("/verify-email-change/:token", authController.verifyEmailChange)
router.post("/resend-email-change",
    createRateLimiter(
        60 * 60 * 1000,
        10,
        "Too many resend attempts. Please try again after 1 hour."
    ),
    authMiddleware,
    authController.resendEmailChange
)
module.exports = router