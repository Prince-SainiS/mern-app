const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const {MongoMemoryServer} =require("mongodb-memory-server")

let mongoServer;

// runs once before all test
beforeAll(async () => {
    process.env.NODE_ENV = "test"; // 👈 add at very top

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri).then(console.log("Connected to in-memory MongoDB"));
})

// runs after each test
afterEach(async () => {
    // clear all collecction
    const collections = mongoose.connection.collections;
    for(const key in collections){
        await collections[key].deleteMany({});
    }
})


// runs once after all tests
afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
})