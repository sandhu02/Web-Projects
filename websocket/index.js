const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from 'public' folder
// app.use(express.static("public"));


// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

    io.emit("chat message",`you are connected to ${socket.id}`)

    socket.on("chat message", (msg) => {
    console.log("Message received:", msg);
    // Broadcast to everyone (including sender)
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
