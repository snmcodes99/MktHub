const CategoryModel = require("../models/Category");
const ProductModel = require("../models/Product");
const slugify = require("slugify");
const ApiError = require("../utils/ApiErrors");
const { getPagination, buildPagination } = require("../utils/pagination.utils");
const { buildProductQuery } = require("../utils/productQuery.util");
const { getCache, setCache, deleteCache, clearCachePattern } = require("../utils/redis.utils");
const { buildProductListCacheKey } = require("../utils/cacheKey.util");
const { uploadImages, deleteImage, deleteImages } = require("./cloudinaryService");
const createProduct = async (productdata, files, sellerId) => {
    const { name, description, brand, category, mrp, sellingPrice, stock, keyHighlights } = productdata
    const slug = slugify(name, {
        lower: true,
        strict: true,
        trim: true
    })
    const existCategory = await CategoryModel.exists({ _id: category, isActive: true })
    if (!existCategory) {
        throw new ApiError(404, "Category not found")
    }
    const existProduct = await ProductModel.findOne({
        seller: sellerId,
        slug
    })
    if (existProduct) {
        throw new ApiError(409, "product already exist");
    }
    if (!files || files.length === 0) {
        throw new ApiError(400, "At least one product image is required");
    }
    let uploadedImages = [];
    try {
        uploadedImages = await uploadImages(files);
        const product = await ProductModel.create({
            name,
            description,
            slug,
            brand,
            keyHighlights,
            category,
            seller: sellerId,
            mrp,
            sellingPrice,
            stock,
            images: uploadedImages
        });
        await clearCachePattern("product_list:*");
        return product;

    }
    catch (error) {
        if (uploadedImages.length > 0) {
            const publicIds = uploadedImages.map(
                image => image.publicId
            );
            await deleteImages(publicIds);
        }
        throw error;
    }
}

const getAllProducts = async (query) => {
    const cacheKey = buildProductListCacheKey(query)
    const cachedProducts = await getCache(cacheKey)

    if (cachedProducts) {
        console.log("Cache Hit")
        return cachedProducts
    }

    console.log("Cache Miss")
    const { page, limit, skip } = getPagination(query);
    const { filter, sortOption } = buildProductQuery(query)
    const [products, totalItems] = await Promise.all([
        ProductModel.find(filter)
            .select(
                "name mrp sellingPrice averageRating totalReviews stock images category"
            )
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .populate("seller", "name")
            .populate("category", "name")
            .lean(),
        ProductModel.countDocuments(filter)
    ])
    const pagination = buildPagination(
        page, limit, totalItems
    )
    const response = {
        products,
        pagination
    }

    await setCache(
        cacheKey,
        response,
        120
    )

    return response
}

const getProductByid = async (id) => {
    const cachedProduct = await getCache(`product:${id}`)

    if (cachedProduct) {
        console.log("Cache Hit")
        return cachedProduct
    }
    console.log("Cache miss")
    const product = await ProductModel.findOne({
        _id: id,
        isActive: true
    })
        .populate("seller", "name")
        .populate("category", "name")
        .lean()
    if (!product) {
        throw new ApiError(404, "product not found")
    }
    await setCache(
        `product:${id}`,
        product,
        600
    )
    return product
}

const updateProduct = async (productId, updateData, files, seller) => {
    const product = await ProductModel.findById(productId);
    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found");
    }
    const sellerId = seller._id;
    const sellerRole = seller.role;
    if (sellerRole === "SELLER") {
        if (product.seller.toString() !== sellerId.toString()) {
            throw new ApiError(403, "You are not allowed to update");
        }
    }
    if (updateData.category) {
        const existCategory = await CategoryModel.exists({
            _id: updateData.category,
            isActive: true
        });

        if (!existCategory) {
            throw new ApiError(404, "Category not found");
        }
    }
    if (updateData.name) {
        const slug = slugify(updateData.name, {
            lower: true,
            strict: true,
            trim: true
        });
        const existingProduct = await ProductModel.findOne({
            seller: product.seller,
            slug,
            _id: { $ne: productId }
        });
        if (existingProduct) {
            throw new ApiError(409, "Product already exists");
        }
        updateData.slug = slug;
    }
    const newMrp = updateData.mrp ?? product.mrp;
    const newSellingPrice = updateData.sellingPrice ?? product.sellingPrice;
    if (newSellingPrice > newMrp) {
        throw new ApiError(
            400,
            "Selling price cannot be greater than MRP"
        );
    }
    let uploadedImages = [];
    const oldImages = product.images;
    try {
        if (files && files.length > 0) {
            uploadedImages = await uploadImages(files);
          updateData.images = uploadedImages;
        }
        Object.assign(product, updateData);
        await product.save();
        await deleteCache(`product:${productId}`);
        await clearCachePattern("product_list:*");
        if (files && files.length > 0 && oldImages.length > 0) {
            const publicIds = oldImages.map(
                ({ publicId }) => publicId
            );
         try {
                await deleteImages(publicIds);
            } 
            catch (err) {
                console.error(
                    "Failed to delete old Cloudinary images:",
                    err.message
                );
            }
        }
        return product;

    } 
    catch (error) {
        if (uploadedImages.length > 0) {
            const publicIds = uploadedImages.map(
                ({ publicId }) => publicId
            );
           await deleteImages(publicIds);
        }
        throw error;
    }
}

const deleteProduct = async (productId, seller) => {

    const product = await ProductModel.findOne({
        _id: productId,
        isActive: true
    });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const sellerId = seller._id;
    const sellerRole = seller.role;

    if (sellerRole === "SELLER") {

        if (product.seller.toString() !== sellerId.toString()) {
            throw new ApiError(403,"You are not allowed to delete");
        }

    }
    product.isActive = false;
    await product.save();
    await deleteCache(`product:${productId}`);
    await clearCachePattern("product_list:*");
    return product;
}
const toggleProductActive = async (productId, seller) => {
    const product = await ProductModel.findById(productId);
    if (!product) {
        throw new ApiError(404, "product not found")
    }
    const sellerId = seller._id
    const sellerRole = seller.role

    if (sellerRole === "SELLER") {
        if (product.seller.toString() !== sellerId.toString()) {
            throw new ApiError(403, "you are not allowed to update this product");
        }
    }

    product.isActive = !product.isActive;
    await product.save();
    await deleteCache(`product:${productId}`)
    await clearCachePattern("product_list:*");
    return product;
}

module.exports = {
    createProduct,
    getAllProducts,
    getProductByid,
    updateProduct,
    deleteProduct,
    toggleProductActive
}