const winston = require("winston");
const path = require("path");



// STEP 1 - DEFINE log levels
const levels = {
    error : 0,
    warn : 1,
    info : 2,
    http : 3,
    debug : 4,
};
// lower number = higher priority'

// step 2 - define colors for console
const colors = {
    error : "red",
    warn : "yellow",
    info : "green",
    http : "magenta",
    debug : "white"
}

winston.addColors(colors);

// step 3 : define log level based on environment
const level = () => {
    const env= process.env.NODE_ENV ||  "development";
    const isDevelopment = env === "development";
    return isDevelopment ?"debug" : "warn";
    // development → log everything (debug and above)
    // production  → log only warn and error
}

// step 4 define format for console
const consoleFormat = winston.format.combine(
    winston.format.colorize({all : true}),
    // add colors to console output

    winston.format.timestamp({format : "YYYY-MM-DD HH:mm:ss"}),

    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// step 5 define format for files
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format : "YYYY-MM-DD HH:mm:ss"}),
    winston.format.errors({stack : true}),
    // include stack for errors

    winston.format.json()
    //json format fro files
)

// step 6 define where to send logs( tranports)
const transports = [
    new winston.transports.Console({
        format: consoleFormat
    }),

    // error log file (only for errors)
    new winston.transports.File({
        filename : path.join(__dirname , "../logs/error.log"),
        level : "error",
        format : fileFormat
    }),

    new winston.transports.File({
        filename : path.join(__dirname , "../logs/combined.log"),
        format : fileFormat,
    })
];

const logger = winston.createLogger({
    level : level(),
    levels,
    transports,
})

module.exports = logger;