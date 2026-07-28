const { Queue, Worker } = require("bullmq")
const { redisConnection } = require("../../config/redis")

module.exports = {
    Queue,
    Worker,
    redisConnection
}