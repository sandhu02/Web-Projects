let socket ;
let playerName = ""
let playerSymbol = ""

function getname(){
    playerName = prompt("Enter your name")
    let nameEl = document.getElementById("player-name")
    nameEl.innerText = `Hello ${playerName}`
}
function getSymbol(){
    playerSymbol = prompt("Enter your Symbol")
}

const connectServerEl = document.getElementById("connect-server")

connectServerEl.addEventListener("click", function() {
    getname()
    getSymbol()

    socket = io("http://localhost:3000" , {
        auth: {
            playerName
        }
    });

    connectServerEl.remove()
            
    socket.on("connect", () => {
    console.log("Connected to server with ID:", socket.id);
    });

    socket.emit("join-game" , {playerName , playerSymbol})

    socket.on("join-game" , (data)=>{
        console.log(data)
        let headerEl = document.getElementById("header")
        const newEl = document.createElement("div")
        newEl.id = "waiting"; 
        newEl.innerHTML = `<h2>${data}</h2>`
        headerEl.appendChild(newEl) 
    })
    
    socket.on("second-player-joined" , (data) => {
        const waitingEl = document.getElementById("waiting")
        waitingEl.innerHTML = `<h2>${data}</h2>`
    })

    clickbox(socket) 

    socket.on("box-clicked" , (data)=>{
        const boxEl = document.getElementById(data.boxNumber)
        boxEl.innerText = data.playerSymbol

        makeClickedNotification(data)
    })

    socket.on("disconnect", () => {
    console.log("Disconnected from server");
    });

    socket.on("room-full", (msg) => {
        alert(msg);
    });
});


function clickbox(socket){
    const cells = document.querySelectorAll("th");
    cells.forEach(cell => {
        cell.addEventListener("click", function() {
            socket.emit("box-clicked" , {
                playerName : playerName, 
                playerSymbol : playerSymbol, 
                boxNumber : cell.id
            }) 
        });
    });
}

function makeClickedNotification(data){
    const clickEl = document.getElementById("clicked-notification")

    if (data.playerName === playerName){
        clickEl.innerText = `You clicked ${data.boxNumber}`
    }
    else {
        clickEl.innerText = `${data.playerName} clicked ${data.boxNumber}`
    }

}