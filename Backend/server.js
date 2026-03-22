const express = require("express");
const app = express();

require("dotenv").config();
const PORT = process.env.PORT || 4000;

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

app.listen(PORT,()=>{
    console.log(`App listen in at ${PORT}` );
})
