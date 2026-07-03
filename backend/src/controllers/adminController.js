const adminService = require("../services/adminService")

const getDashboardStats = async (req, res) => {
    const stats = await adminService.getDashboardStats()
    res.status(200).json({
        success: true,
        message: "Dashboard statistics fetched successfully",
        data: stats
    })
}

module.exports = {
    getDashboardStats
}
