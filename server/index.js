const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser")
const userApi = require("./routes/user");
const CatApi = require("./routes/categories");
const PodcastApi = require("./routes/podcast");
const RecommendationsApi = require("./routes/recommendations");
const liveApi = require("./routes/live");
const cors = require("cors");

require("dotenv").config();
require("./connection/connection")

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174'],
        credentials: true,
    }
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_live", (sessionId) => {
        socket.join(sessionId);
        console.log(`User ${socket.id} joined live session: ${sessionId}`);
    });

    socket.on("send_message", (data) => {
        io.to(data.sessionId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

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
app.use("/uploads", express.static("uploads"))

app.use("/api/v1", userApi)
app.use("/api/v1", CatApi)
app.use("/api/v1", PodcastApi)
app.use("/api/v1", RecommendationsApi)
app.use("/api/v1", liveApi)

app.get("/", (req, res) => {
    res.send("Server is running with Socket.io!");
});

server.listen(process.env.PORT, () => {
    console.log(`Server started on port : ${process.env.PORT}`);
});