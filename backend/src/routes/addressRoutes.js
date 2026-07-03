const express = require("express")

const authMiddleware = require("../middleware/auth/authMiddleware")

const validateAllowedField = require("../middleware/validation/validateAllowedField")
const validate = require("../middleware/validation/validate")

const addressController = require("../controllers/addressController")

const { createAddressValidation, updateAddressValidation } = require("../middleware/validation/addressValidation")
const { mongoIdValidation } = require("../middleware/validation/commonValidation")

const router = express.Router()

router.post("/",
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
    authMiddleware,
    mongoIdValidation("id"),
    validate,
    addressController.deleteAddress
)
router.patch("/:id/default",
    authMiddleware,
    mongoIdValidation("id"),
    validate,
    addressController.setDefaultAddress
)
module.exports = router    