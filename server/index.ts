import { Express, Request, Response, Router } from "express"
import { Socket } from "socket.io"

const express = require("express")
const cors = require("cors")
const http = require("http")
const { Server } = require("socket.io")
const registerPaymentHandler = require("./registerPaymentHandler")
const paymentRoute: Router = require("./routes/paymentRoute")

// Create express server and initialized server configuration
const app: Express = express()
const port: number = 8000
app.use(express.json())
app.use(cors({ origin: "http://localhost:3000" }))

// Create server for using web socket from socket.io library
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
})

// Handling Payment route request
app.use("/api/crypto/payments", paymentRoute)

// Handling Root route request
app.get("/", (req: Request, res: Response) => {
    res.status(200).send("Hashpays MVP Server")
})

// Handle Web Socket event
io.on("connection", (socket: Socket) => {
    console.log(`a user connected with ${socket.id}`)

    socket.on("hello", (data: { message: string }) => {
        console.log(data.message)
        // Boardcast to every client connected to our server
        socket.emit("receive_message", {
            message: "Hello Client, This message is sent back from server",
        })
    })

    // Payment handler for web socket event that will send from client
    registerPaymentHandler(io, socket)
})

server.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`)
})

export default server
