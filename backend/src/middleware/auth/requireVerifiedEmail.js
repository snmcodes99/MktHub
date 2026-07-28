const ApiError = require("../../utils/ApiErrors");

const requireVerifiedEmail = (req, res, next) => {
    if (!req.user || !req.user.isEmailVerified) {
        return next(
            new ApiError(
                403,
                "Please verify your email before performing this action.",
                null,
                "EMAIL_NOT_VERIFIED"
            )
        );
    }
    next();
};

module.exports = requireVerifiedEmail;
