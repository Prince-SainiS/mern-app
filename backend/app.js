const express = require("express");
const morgan = require("morgan");
const logger = require("./utils/logger")
const helmet = require("helmet");
const cors = require("cors")
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const {globalLimiter} = require("./middleware/rateLimiter")
const corsOptions = require("./config/corsOptions")


const connectDB = require("./config/db_connection")

const app = express();

// development -> detailed colored logs
if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"));
}

// production -> standard format for log files
if(process.env.NODE_ENV=== "production"){
    app.use(morgan("combined"))
}

const morganStream = {
    write : (message) => logger.http(message.trim())
};
app.use(morgan("combined" , {stream : morganStream}))

const routes = require("./routes/index")
const errorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/AppError");

// connectDB();

// SECURITY MIDDLEWARE - ADD AT VERY TOP

// ─────────────────────────────────────
// SECURITY MIDDLEWARE
// ─────────────────────────────────────
app.use(helmet());  //set all 11 headers automatically //1. secure headers
app.use(cors(corsOptions))                             // 2. CORS
// app.use(globalLimiter);                                 // 3. ratelimiting

// ─────────────────────────────────────
// BODY PARSER
// ─────────────────────────────────────
app.use(express.json({ limit : "10kb" }));
app.use(express.urlencoded({extended : true , limit: "10kb"}));
// 10kb is enough for normal JSON requests login signup profile ubdate etc.
app.use(cookieParser());

// ─────────────────────────────────────
// DATA SANITIZATION
// ─────────────────────────────────────
app.use(mongoSanitize());           // 4.NoSQL injection
// app.use(xss());                     // 5. XSS attacks
// must be after express.json() ✅
// because it sanitizes req.body
// which needs to be parsed first 

// HTTP PARAMETER POLLUTIONN
app.use(hpp({                        // 6. HTTP param pollution
    whitelist : [
        // fields allowed to have duplicate values
        "price",
        "rating",
        "category"
    ]
}));

// ─────────────────────────────────────
// ROUTES
// ─────────────────────────────────────
app.get("/" , (req, res) => {
    res.send("Server running properly")
})

app.use("/api" , routes);

app.all("*" , (req, res , next) => {
    next(new AppError(`Route ${req.url} not found` , 400))
});

// ─────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────
app.use(errorHandler);
module.exports = app;