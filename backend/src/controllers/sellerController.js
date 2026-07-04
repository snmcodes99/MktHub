const sellerService = require("../services/sellerService");

const getDashboard = async (req, res, next) => {
    try {
        const sellerId = req.user._id;
        const stats = await sellerService.getDashboardStats(sellerId);
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboard
};
