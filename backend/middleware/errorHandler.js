const logger = require("../utils/logger")

const errorHandler = (err, req ,res , next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    // log the error
    logger.error(`${err.statusCode} - ${err.message} -${req.originalUrl} - ${req.method} - ${req.ip}`);

     console.log("FULL STACK:", err.stack);
    if(process.env.NODE_ENV === "development") {
        logger.error(err.stack);
    }
    // handle payload to large error
    if(err.type === "entity.too.large"){
        return res.status(413).json({
            status : "fail",
            message : "Request size too large, maximum size is 10kb"
        })
    }

    res.status(err.statusCode).json({
        status : err.status,
        message : err.message,
    })
};

module.exports = errorHandler;