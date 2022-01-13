const { v4 } = require('uuid')

module.exports = class Player{
    constructor(name) {
        this.id = v4()
        this.name = name
        this.color = Math.floor(Math.random() * 360);
        this.score = 0
        this.lastMove = new Date()
    }
}