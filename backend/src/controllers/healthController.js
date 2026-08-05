const mongoose = require("mongoose");
const { redisClient } = require("../config/redis");

const getHealth = async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        
        const dbStatus = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting",
            99: "uninitialized",
        };

        let redisState = "disconnected";
        if (redisClient && redisClient.isOpen) {
            try {
                await redisClient.ping();
                redisState = "connected";
            } catch (err) {
                redisState = "error";
            }
        }

        const healthInfo = {
            status: "OK",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            services: {
                database: dbStatus[dbState] || "unknown",
                redis: redisState
            }
        };

        // If any critical service is down, we can return 503 for a load balancer to know it's not healthy
        if (dbState !== 1 || redisState !== "connected") {
            healthInfo.status = "DEGRADED";
            return res.status(503).json(healthInfo);
        }

        res.status(200).json(healthInfo);
    } catch (error) {
        res.status(500).json({
            status: "ERROR",
            timestamp: new Date().toISOString(),
            message: error.message
        });
    }
};

module.exports = {
    getHealth
};
