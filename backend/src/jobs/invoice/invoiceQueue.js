const { Queue, redisConnection } = require("../shared/bull");

const invoiceQueue = new Queue("invoice-queue", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000
        },
        removeOnComplete: 100,
        removeOnFail: 500
    }
});

module.exports = invoiceQueue;