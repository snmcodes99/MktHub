const cron = require("node-cron")
const { processExpiredReservationsBatch } = require("./reservationExpiryJob")

let isRunning = false

const startSchedulers = () => {
    cron.schedule("* * * * *", async () => {
        if (isRunning) {
            console.log("Reservation expiry job already running, skipping...")
            return
        }
        isRunning = true
        try {
            const result = await processExpiredReservationsBatch()
            console.log(`Reservation expiry job completed. Processed: ${result.processed}`)
        } catch (error) {
            console.error("Reservation expiry job failed:", error)
        } finally {
            isRunning = false
        }
    })

    console.log("Schedulers started")
}

module.exports=startSchedulers