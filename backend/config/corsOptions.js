const corsOptions = {
    // allowed origins
    origin: (origin, callback) => {
        const allowedOrgins = [
            "https://mern-app-jet-ten.vercel.app",
            "http://localhost:3000",     // React dev server
            "http://localhost:5173",     // Vite dev server
            process.env.FRONTEND_URL    // production frontend
        ];

        // allow request with no origin
        // (mobile apps , Postman ,curl)
        if(!origin){
            return callback(null , true); //allow
        }

        if(allowedOrgins.includes(origin)){
            callback(null , true); //origin aloowed
        } else {
            callback(new Error("Not allowed by CORS")); //blocked
        }
    },

    // ALLOWED METHODS
    methods : ["GET" , "POST" , "PUT" , "PATCH" , "DELETE"],
    // only these HTTP methods allowed

    // allowed headers
    allowedHeaders : [
        "Content-Type",
        "Authorization"
    ], //only these headers allowed in request

    // ALLOW CREDENTIALS
    credentials : true,
    // allow cookies to be sent
    // needed for refresh token cookie

    // PREFLIGHT CACHE
    maxAge : 86400, //86400 = 24HOURS
    // browser caches preflight response
    // for(24 hours)
    // reduces OPTIONS REQUEST

}

module.exports = corsOptions;