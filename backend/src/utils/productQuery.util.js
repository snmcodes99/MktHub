const buildProductQuery = (query) => {
    const { category, brand, minPrice, maxPrice, search, sort } = query;
    const filter = {};
    if (query.showInactive !== "true") {
        filter.isActive = true;
    }
    if (category) {
        const categories = category.split(',');
        filter.category = { $in: categories };
    }
    if (brand) {
        filter.brand = {
            $regex: brand,
            $options: "i"
        };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.sellingPrice = {};
        if (minPrice !== undefined) {
            filter.sellingPrice.$gte = Number(minPrice);
        }
        if (maxPrice !== undefined) {
            filter.sellingPrice.$lte = Number(maxPrice);
        }
    }

    let sortOption = {};

    if (sort === "price_asc") {
        sortOption.sellingPrice = 1;
    }
    else if (sort === "price_desc") {
        sortOption.sellingPrice = -1;
    }
    else if (sort === "-createdAt" || sort === "newest") {
        sortOption.createdAt = -1;
    }
    else if (sort === "createdAt" || sort === "oldest") {
        sortOption.createdAt = 1;
    }
    else if (sort === "-averageRating" || sort === "rating") {
        sortOption.averageRating = -1;
    }
    if (search) {
        filter.$or = [
            {
                name: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                brand: {
                    $regex: search,
                    $options: "i"
                }
            }
        ];
    }

    return {
        filter,
        sortOption
    };
}

module.exports = {
    buildProductQuery
}