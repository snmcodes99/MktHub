const express = require("express")

const authMiddleware = require("../middleware/auth/authMiddleware")

const validateAllowedField = require("../middleware/validation/validateAllowedField")
const validate = require("../middleware/validation/validate")
const createRateLimiter = require("../middleware/rateLimit/createRateLimiter")

const addressController = require("../controllers/addressController")

const { createAddressValidation, updateAddressValidation } = require("../middleware/validation/addressValidation")
const { mongoIdValidation } = require("../middleware/validation/commonValidation")

const router = express.Router()

router.post("/",
    createRateLimiter(15 * 60 * 1000, 20, "Too many address creation attempts. Please try again after 15 minutes."),
    authMiddleware,
    validateAllowedField([
        "name",
        "phoneNo",
        "houseNo",
        "street",
        "city",
        "state",
        "country",
        "zipCode",
        "addressType",
        "isDefault"
    ]),
    createAddressValidation,
    validate,
    addressController.createAddress
)
router.get("/",
    authMiddleware,
    addressController.getMyAddresses
)

router.patch("/:id",
    createRateLimiter(15 * 60 * 1000, 30, "Too many address update attempts. Please try again after 15 minutes."),
    authMiddleware,
    mongoIdValidation("id"),
    validateAllowedField([
        "name",
        "phoneNo",
        "houseNo",
        "street",
        "city",
        "state",
        "country",
        "zipCode",
        "addressType",
        "isDefault"
    ]),
    updateAddressValidation,
    validate,
    addressController.updateAddress
)
router.delete("/:id",
    createRateLimiter(15 * 60 * 1000, 20, "Too many address deletion attempts. Please try again after 15 minutes."),
    authMiddleware,
    mongoIdValidation("id"),
    validate,
    addressController.deleteAddress
)
router.patch("/:id/default",
    createRateLimiter(15 * 60 * 1000, 30, "Too many attempts. Please try again after 15 minutes."),
    authMiddleware,
    mongoIdValidation("id"),
    validate,
    addressController.setDefaultAddress
)
module.exports = router    