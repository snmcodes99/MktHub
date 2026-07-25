const { redisClient } = require("../config/redis")

const getCache = async (key) => {
    try {
        const data = await redisClient.get(key)

        if (!data) {
            return null
        }

        return JSON.parse(data)
    } catch (err) {
        console.log("redis get failed")
        return null
    }
}

const setCache = async (key, value, ttl) => {
    try {
        await redisClient.set(
            key,
            JSON.stringify(value),
            {
                EX: ttl
            }
        )
    } catch (err) {
        console.log("redis set failed")
    }
}

const deleteCache = async (key) => {
    try {
        await redisClient.del(key)
    } catch (err) {
        console.log("redis delete failed")
    }
}

module.exports = {
    getCache,
    setCache,
    deleteCache
}