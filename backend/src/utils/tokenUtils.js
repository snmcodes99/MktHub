const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

const generateAccessToken = (userId) => {
    return jwt.sign(
        {
            id: userId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    )
}

const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString("hex")
}

const hashToken  = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex")
}

const getRefreshTokenExpiry = () => {
    return new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
}

const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
})
const generateSecureToken  = () => {
    return crypto.randomBytes(32).toString("hex")
}
module.exports = {
    generateAccessToken,
    generateRefreshToken,
    hashToken ,
    getRefreshTokenExpiry,
    getRefreshCookieOptions,
    generateSecureToken ,
    REFRESH_TOKEN_TTL_MS
}