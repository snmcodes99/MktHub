const { createClient } = require("redis")

const redisClient = createClient({
    url: process.env.REDIS_URL
})

redisClient.on("connect", () => {
    console.log("connecting to redis")
})

redisClient.on("ready", () => {
    console.log("redis connected")
})

redisClient.on("error", (err) => {
    console.log("redis error:", err.message)
})

redisClient.on("reconnecting", () => {
    console.log("reconnecting to redis")
})

redisClient.on("end", () => {
    console.log("redis connection closed")
})

const connectRedis = async () => {
    if (redisClient.isOpen) {
        return
    }

    try {
        await redisClient.connect()
    } catch (err) {
        console.log("failed to connect redis")
        console.log(err.message)
        console.log("continuing without redis...")
    }
}
const redisConnection = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD || undefined
}
module.exports = {
    redisClient,
    connectRedis,
    redisConnection
}