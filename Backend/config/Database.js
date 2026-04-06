const mongoose = require("mongoose");

require("dotenv").config();

exports.dbConnect = async () =>{
    try {
        const mongoUrl = process.env.DATABASE_URL || process.env.MONGO_URI;

        if (!mongoUrl) {
            throw new Error("Missing DATABASE_URL or MONGO_URI in environment variables");
        }

        await mongoose.connect(mongoUrl);
        console.log("DB connection Successful");
    } catch (error) {
        console.log(error);
        process.exit()
    }
}
