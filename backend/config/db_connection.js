const mongoose = require("mongoose");
const DB_PASSWORD = process.env.DB_PASSWORD

const url = `mongodb+srv://admin1:${DB_PASSWORD}@cluster0.4ocnukk.mongodb.net/scratch`


const connectDb = async () => {
    try{
        await mongoose.connect(url);
        console.log("Database connected successfully!!");
    } catch(error) {
        console.log(error)
    }
}

module.exports = connectDb;