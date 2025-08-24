const express = require("express")
const app = express()

const http = require("http");
const server = http.createServer(app)

const socket_io = require('socket.io')
const io = socket_io(server , {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
})

app.use(express.static("public"))
app.use(express.json())

server.listen(3000 , ()=>{console.log("server listening on port 3000")})

let players = []

io.on('connection',(socket)=>{
    console.log("user connected : ",socket.id)

    socket.on("join-game", (data) => {
        console.log(data);
        if (players.length >= 2) {
            socket.emit("room-full", "Sorry, the game is already full!");
            socket.disconnect();
            return;
        }

        socket.playerName = data.playerName
        players.push({
            id: socket.id,
            playerName: data.playerName,
            playerSymbol: data.playerSymbol
        });

        socket.emit("join-game", "waiting for other player...");

        if (players.length === 2) {
            const [p1, p2] = players;

            io.to(p1.id).emit("second-player-joined", `connected to ${p2.playerName}`);
            io.to(p2.id).emit("second-player-joined", `connected to ${p1.playerName}`);
        }

    });
    
    socket.on("box-clicked" , (data)=>{
        console.log(`${data.playerName} clicked box ${data.boxNumber}`)
        const otherPlayer = players.find(p => p.id !== socket.id);
        io.to(otherPlayer.id).emit("box-clicked" , data)
        io.to(socket.id).emit("box-clicked" , data)
    })

    socket.on("disconnect" , () => {
        console.log(players)
        players = players.filter(p => p.id !== socket.id);
        console.log("user disconnected : ",socket.id)
    })
})
