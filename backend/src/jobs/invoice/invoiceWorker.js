const { Worker, redisConnection } = require("../shared/bull");
const { generateAndSendInvoice } = require("../../services/invoiceService");

const invoiceWorker = new Worker(
    "invoice-queue",
    async (job) => {
        const { orderId } = job.data;
        await generateAndSendInvoice(orderId);
    },
    {
        connection: redisConnection
    }
);

invoiceWorker.on("completed", (job) => {
    console.log(`Invoice generated for order ${job.data.orderId}`);
});

invoiceWorker.on("failed", (job, err) => {
    console.error(
        `Invoice job failed for order ${job.data.orderId}`,
        err.message
    );
});