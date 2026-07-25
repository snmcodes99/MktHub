const buildProductListCacheKey = (query) => {
    const keys = Object.keys(query).sort()

    let cacheKey = "products"

    for (const key of keys) {
        const value = query[key]

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            continue
        }

        cacheKey += `:${key}=${value}`
    }

    return cacheKey
}

module.exports = {
    buildProductListCacheKey
}