const { Queue, redisConnection } = require("../shared/bull")

const emailQueue = new Queue(
    "email",
    {
        connection: redisConnection,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000
            },
            removeOnComplete: 100,
            removeOnFail: 50
        }
    }
)

module.exports = emailQueue