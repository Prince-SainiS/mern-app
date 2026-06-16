const rateLimit = require("express-rate-limit");

const noOpMiddleware = (req, res, next) => next();
// GLOBAL LIMITER
// applies to all queries
const globalLimiter =process.env.NODE_ENV === "test"
    ? noOpMiddleware :
    rateLimit({
    windowMs : 100 * 60 * 1000, //time window , 15 minutes in milliseconds

    max : 1000,
    // max request per windowMs per IP
    // 100 request per 15 mins

    message : {
        status : "fail",
        message : "Too many request from this IP , Please try again after 15 minutes"
    },

    standardHeaders : true,
    // add RateLimit headers to response:
    // RateLimit-Limit: 100
    // RateLimit-Remaining: 99
    // RateLimit-Reset: 2024-01-01T00:00:00.000Z
    // tells client how many requests remaining 

    legacyHeaders: false,
    // disables old X-RateLimit headers
    // we use standard headers instead
});

const authLimiter = process.env.NODE_ENV === "test"
    ? noOpMiddleware :
    rateLimit({
    windowMs : 100 * 60 *1000,

    max : 1000,

    skip : (req) => {process.env.NODE_ENV === "test"},
    message : {
        status : "fail",
        message : "too many login attempts, please try again after 15 minutes"
    },
    standardHeaders : true,
    legacyHeaders : false,
})

module.exports = {globalLimiter , authLimiter}