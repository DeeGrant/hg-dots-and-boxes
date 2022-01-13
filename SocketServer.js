const WebSocketServer = require('ws').Server;
const Player = require('./Player')
const Game = require('./Game')

module.exports = class Server {
    constructor(game, server) {
        this.wss = new WebSocketServer({server: server})
        this.clients = new Map();
        this.game = game

        this.wss.on('connection', (ws) => {
            const metadata = new Player("Player " + (this.clients.size + 1));

            console.log("new connection")

            this.clients.set(ws, metadata);

            ws.send(JSON.stringify({type: "self", data: metadata}))

            for(const client of this.clients.keys()) {
                client.send(JSON.stringify({type: "newPlayer", data: metadata}))
            }

            ws.on('message', (messageAsString) => {
                const message = JSON.parse(messageAsString)
                const metadata = this.clients.get(ws)

                message.id = metadata.id

                console.log("new message", message.type)

                if(message.type === "move") {
                    const now = new Date()
                    if((now - metadata.lastMove)/1000 > 9.5){
                        const move = this.game.move(message.side, metadata)
                        console.log(move)
                        if(!move.moved){
                            return
                        }
                        if(move.ownerCheck[0]) {
                            metadata.score++
                            for(const client of this.clients.keys()) {
                                client.send(JSON.stringify({type: "scoreUpdate",
                                    x: move.ownerCheck[0].x,
                                    y: move.ownerCheck[0].y,
                                    color: metadata.color,
                                    id: metadata.id,
                                    score: metadata.score}))
                            }
                        }
                        if(move.ownerCheck[1]){
                            metadata.score++
                            for(const client of this.clients.keys()) {
                                client.send(JSON.stringify({type: "scoreUpdate",
                                    x: move.ownerCheck[1].x,
                                    y: move.ownerCheck[1].y,
                                    color: metadata.color,
                                    id: metadata.id,
                                    score: metadata.score}))
                            }
                        }

                        metadata.lastMove = now
                        message.color = metadata.color
                        ws.send(JSON.stringify({type: "timer", now}))
                        for(const client of this.clients.keys()) {
                            client.send(JSON.stringify(message))
                        }
                    }
                }

                if(message.type === "nameChange") {
                    metadata.name = message.name
                    for(const client of this.clients.keys()) {
                        client.send(JSON.stringify({type:"nameChange", data: metadata}))
                    }
                }

                const outbound = JSON.stringify(message)
            })

            ws.on("close", () => {
                this.clients.delete(ws);
            })
        })

        this.completeGame = function() {
            for(const client of this.clients.keys()) {
                client.send(JSON.stringify({type: "gameOver"}))
            }
        }

    }
}