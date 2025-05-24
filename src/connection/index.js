const { MongoClient } = require("mongodb");
const uri = process.env.DB_URL;

const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client.db("tracking_app");
    } catch (e) {
        console.error(e);
    }
}

module.exports = connectDB;
