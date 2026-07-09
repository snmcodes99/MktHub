const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

const getPagination = (query) => {
    let page = Number(query.page);
    let limit = Number(query.limit);
    if (isNaN(page)) {
        page = DEFAULT_PAGE;
    }
    if (isNaN(limit)) {
        limit = DEFAULT_LIMIT;
    }
    if (page < 1) {
        page = DEFAULT_PAGE;
    }
    if (limit < 1) {
        limit = DEFAULT_LIMIT;
    }
    if (limit > MAX_LIMIT) {
        limit = MAX_LIMIT;
    }
    const skip = (page - 1) * limit;
    return {
        page,
        limit,
        skip
    };
};

const buildPagination = (page, limit, totalItems) => {
    const totalPages = Math.ceil(totalItems / limit);
    return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
    };
};

module.exports = {
    getPagination,
    buildPagination
};