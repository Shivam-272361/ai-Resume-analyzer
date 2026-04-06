const express = require("express");
const cors = require("cors");
const app = express();
require("./utility/cleanUp"); // adjust path

require("dotenv").config();
const PORT = process.env.PORT || 4000;

app.use(cors({
   origin: "https://your-frontend.vercel.app",
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is up and running smoothly!"
    });
})

const {dbConnect} = require("./config/Database");
dbConnect();

const routes = require("./routers/resumeRoutes");

app.use("/api/v1",routes);
app.use("/uploads", express.static("uploads"));

app.listen(PORT,()=>{
    console.log(`App listen in at ${PORT}` );
})
