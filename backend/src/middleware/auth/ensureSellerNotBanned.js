const ApiError = require("../../utils/ApiErrors");

const ensureSellerNotBanned = (req, res, next) => {
    if (req.user && req.user.isBanned) {
        return next(new ApiError(403, "You have been banned from performing seller operations."));
    }
    next();
};

module.exports = ensureSellerNotBanned;
