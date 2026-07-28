const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./src/config/db")
const { connectRedis } = require("./src/config/redis");
const boot = require("./src/config/boot")
const startScheduler = require("./src/jobs/reservation/schedular");
const startWorkers = require("./src/jobs/startWorkers");

const app = require("./src/app");

const PORT = (process.env.PORT) ? process.env.PORT : 3000;


const startServer = async () => {
    try {
        await connectDB()
        await connectRedis()
        await boot()
        startWorkers()
        startScheduler()
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
    app.listen(PORT, () => {
        console.log(`server listioing at port ${PORT}`)
    })
}

startServer()