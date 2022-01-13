const express = require("express");
const Server = require('./SocketServer');
const Game = require('./Game')
const http = require("http")

const app = express()
const server = http.createServer(app)

const port = 3000

const game = new Game(5)

app.get("/game", (req, res) => res.send(game.tiles));
app.get("/players", (req, res) => res.send());


const wsServer = new Server(game, server);

app.get('/game', (req, res) => res.send(game.tiles))
app.get('/player', (req, res) => {
    console.log("getplayers")
    res.send(Array.from(wsServer.clients.values()))}
)
app.get('/size', (req, res) => res.send(game.boardSize.toString()))

app.use(express.static('public'))

server.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
);



function checkGame() {
    if(game.checkGame()) {
        wsServer.completeGame()
    }
    else {
        console.log("No winner game continues")
        setTimeout(checkGame, 8080)
    }
}

checkGame()