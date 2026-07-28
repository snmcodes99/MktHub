const ReservationModel = require("../../models/Reservation")
const { processExpiredReservation } = require("../../services/reservationExpiryService")

const GRACE_PERIOD_MS = 2*60* 1000
const BATCH_SIZE = 50

const processExpiredReservationsBatch = async () => {
    const cutoff = new Date(Date.now() - GRACE_PERIOD_MS)
    const reservations = await ReservationModel.find({
        status: "PENDING",
        expiresAt: { $lte: cutoff }
    }).sort({ expiresAt: 1 })
        .limit(BATCH_SIZE)
        .select("_id")
        .lean()

    for (const reservation of reservations) {
        try {
            await processExpiredReservation(reservation._id)
        } catch (error) {
            console.error(
                `Failed to process reservation ${reservation._id}:`,
                error.message
            )
        }
    }

    return {
        processed: reservations.length
    }
}

module.exports = {
    processExpiredReservationsBatch
}