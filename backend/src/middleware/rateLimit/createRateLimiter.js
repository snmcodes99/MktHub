const rateLimit = require("express-rate-limit");

const createRateLimiter = (windowMs, limit, errorMessage) => {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: errorMessage
        }
    });
};

module.exports = createRateLimiter;