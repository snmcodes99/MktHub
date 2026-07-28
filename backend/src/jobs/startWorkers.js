const startWorkers = () => {
    require("./email/emailWorker");
    require("./invoice/invoiceWorker");
    
    console.log("BullMQ Workers Started");
};

module.exports = startWorkers;
