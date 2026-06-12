const dotenv = require("dotenv");
dotenv.config();
const app = require("./app")
const logger =  require("./utils/logger")
const connectDb = require("./config/db_connection")
const PORT = process.env.PORT || 5000;

connectDb();

// CATCH UNCAUGHT EXCEPTIONS
// (SYNCHRONOUS ERROR NOT IN TRY-CATCH)
process.on("uncaughtException" ,(err) => {
    logger.error("UNCAUGHT EXCEPTION!! Shutting down...");
    logger.error(err.name , err.message);
    process.exit(1);
    // exit immediately
} )


const server = app.listen(PORT , () => {
    logger.info(`Server started at port ${PORT}`);
})

// CAUGHT UNHANDLED PROMISE REJECTIONS
// (ASYNC ERRORS NOT CAUGHT)

process.on("unhandledRejection" , (err) => {
    logger.error("UNHANDLED REJECTION! Shutting down...");
    logger.error(err.name , err.message);

    // close server gracefully then exit
    server.close(() => {
        process.exit(1);
    })
})