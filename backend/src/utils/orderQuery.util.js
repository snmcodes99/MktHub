const buildOrderQuery = (query) => {
    const { orderStatus, paymentStatus, minAmount, maxAmount, orderNumber, sort } = query;
    const filter = {};

    if (orderStatus) {
        filter.orderStatus = orderStatus;
    }

    if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
        filter.totalPrice = {};
        if (minAmount !== undefined) {
            filter.totalPrice.$gte = Number(minAmount);
        }
        if (maxAmount !== undefined) {
            filter.totalPrice.$lte = Number(maxAmount);
        }
    }

    if (orderNumber) {
        filter.orderNumber = {
            $regex: orderNumber,
            $options: "i"
        };
    }

    let sortOption = {};

    if (sort === "amount_asc") {
        sortOption.totalPrice = 1;
    }
    else if (sort === "amount_desc") {
        sortOption.totalPrice = -1;
    }
    else if (sort === "-createdAt" || sort === "newest") {
        sortOption.createdAt = -1;
    }
    else if (sort === "createdAt" || sort === "oldest") {
        sortOption.createdAt = 1;
    } else {
        // Default sort
        sortOption.createdAt = -1;
    }

    return {
        filter,
        sortOption
    };
}

module.exports = {
    buildOrderQuery
}
