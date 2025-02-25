const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")
const userApi = require("./routes/user");
const CatApi = require("./routes/categories");
const PodcastApi = require("./routes/podcast");
const cors = require("cors");

require("dotenv").config();
require("./connection/connection")

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS Error: Origin ${origin} is not allowed`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));


app.use(express.json());
app.use(cookieParser());
app.use("/uploads" , express.static("uploads"))

//all routes
app.use("/api/v1", userApi)
app.use("/api/v1", CatApi)
app.use("/api/v1", PodcastApi)

app.get("/", (req, res) => {
    res.send("Server is running inside Docker!");
});

app.listen(process.env.PORT,()=>{
    console.log(`Server started on port : ${process.env.PORT}`);
});