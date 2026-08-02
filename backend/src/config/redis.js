const { createClient } = require("redis");

const redisConnection = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null
};

const redisClient = createClient({
    socket: {
        host: redisConnection.host,
        port: redisConnection.port,
    },
    password: redisConnection.password,
});

redisClient.on("connect", () => {
    console.log("connecting to redis");
});

redisClient.on("ready", () => {
    console.log("redis connected");
});

redisClient.on("error", (err) => {
    console.log("redis error:", err.message);
});

redisClient.on("reconnecting", () => {
    console.log("reconnecting to redis");
});

redisClient.on("end", () => {
    console.log("redis connection closed");
});

const connectRedis = async () => {
    if (redisClient.isOpen) return;

    await redisClient.connect();
};

module.exports = {
    redisClient,
    connectRedis,
    redisConnection,
};