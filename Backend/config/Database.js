const mongoose = require("mongoose");

require("dotenv").config();

exports.dbConnect = async () =>{
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("DB connection Successful");
    } catch (error) {
        console.log(error);
        process.exit()
    }
}
