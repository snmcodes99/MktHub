const { body, param, query } = require("express-validator");
const createProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage("Product name must be between 3 and 100 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .bail()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("brand")
    .trim()
    .notEmpty()
    .withMessage("Brand is required")
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("Brand must be between 2 and 50 characters"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid category id"),
  body("mrp")
    .notEmpty()
    .withMessage("MRP is required")
    .bail()
    .isFloat({ min: 0 })
    .withMessage("mrp must be a positive number"),
  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required")
    .bail()
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number")
    .bail()
    .custom((value, { req }) => {
      if (Number(value) > Number(req.body.mrp)) {
        throw new Error("Selling price cannot be greater than mrp");
      }
      return true;
    }),
  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .bail()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array"),
  body("images.*")
    .optional()
    .isString()
    .withMessage("Each image must be a string"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
]
const updateProductValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty")
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage("Product name must be between 3 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty")
    .bail()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("brand")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Brand cannot be empty")
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("Brand must be between 2 and 50 characters"),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category id"),
  body("mrp")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("mrp must be a positive number"),
  body("sellingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array"),
  body("images.*")
    .optional()
    .isString()
    .withMessage("Each image must be a string"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];
const getProductsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search cannot exceed 100 characters"),

  query("category")
    .optional()
    .custom((value) => {
      const ids = value.split(',');
      const isValid = ids.every(id => /^[0-9a-fA-F]{24}$/.test(id));
      if (!isValid) {
        throw new Error("Invalid category id(s)");
      }
      return true;
    }),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number"),
  query("brand")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Brand must be between 2 and 50 characters"),

  query("inStock")
    .optional()
    .isBoolean()
    .withMessage("inStock must be true or false"),
    
  query("sort")
    .optional()
    .isIn([
      "price_asc",
      "price_desc",
      "createdAt",
      "-createdAt",
      "-averageRating",
    ])
    .withMessage("Invalid sort option"),
];
module.exports = {
  createProductValidation,
  updateProductValidation,
  getProductsValidation
};