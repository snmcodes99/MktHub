const adminService = require("../services/adminService")

const getDashboardStats = async (req, res) => {
    const stats = await adminService.getDashboardStats()
    res.status(200).json({
        success: true,
        message: "Dashboard statistics fetched successfully",
        data: stats
    })
}

const getAllUsers = async (req, res) => {
    const result = await adminService.getAllUsers(req.query)
    res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: result
    })
}

const updateUserRole = async (req, res) => {
    const user = await adminService.updateUserRole(req.params.id, req.body.role)
    res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: user
    })
}

const toggleUserBan = async (req, res) => {
    const user = await adminService.toggleUserBan(req.params.id, req.body.isBanned)
    res.status(200).json({
        success: true,
        message: `User ${req.body.isBanned ? 'banned' : 'unbanned'} successfully`,
        data: user
    })
}

module.exports = {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    toggleUserBan
}
