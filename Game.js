const { v4 } = require('uuid')

module.exports = class Game {
    constructor(size) {
        this.boardSize = size
        this.tiles = []
        let sides = []

        //create the tiles to feed into the sizes object
        for(let i = 0; i < this.boardSize; i++){
            this.tiles[i] = []
            for(let j = 0; j < this.boardSize; j++){
                this.tiles[i][j] = new Tile(i, j)
            }
        }

        //create the sides
        for(let i = 0; i <= this.boardSize; i++){
            for(let j = 0; j < this.boardSize; j++){
                if(i === 0) {
                    //top
                    sides.push(new Side({tileOne: this.tiles[i][j], locOne: "top"}))
                    //left edge
                    sides.push(new Side({tileOne: this.tiles[j][i], locOne: "left"}))
                }
                else if (i === this.boardSize) {
                    //bottom
                    sides.push(new Side({tileOne: this.tiles[i-1][j], locOne: "bottom"}))
                    sides.push(new Side({tileOne: this.tiles[j][i-1], locOne: "right"}))
                }
                else {
                    //middle
                    sides.push(new Side({tileOne: this.tiles[i][j], tileTwo: this.tiles[i-1][j], locOne: "top", locTwo: "bottom"}))
                    sides.push(new Side({tileOne: this.tiles[j][i],  tileTwo: this.tiles[j][i-1], locOne: "left",  locTwo: "right"}))
                }
            }
        }

        this.move = function(id, player) {
            const side = sides.filter(e => e.id === id)[0]
            if(side && side.owner === undefined) {
                return {ownerCheck: side.setOwner(player), moved: true}
            }
            return {moved: false}
        }

        this.checkGame = function() {
            return this.tiles.filter(e => e.owner === undefined).length === 0
        }
    }
}

class Tile {
    constructor(x, y) {
        this.owner = undefined
        this.color = undefined
        this.sides = {}
        this.x = x
        this.y = y

        this.addSide = function(side, location) {
            this.sides[location] = side
        }

        //check to see if the most recent change completed the box
        this.checkOwner = function(last) {
            console.log(last)
            if(Object.values(this.sides).filter(e => e.owner === undefined).length === 0){
                this.owner = last.id
                this.color = last.color
                return this
            }
            return false
        }
    }
}

class Side {
    constructor(args) {
        this.owner = undefined
        this.color = undefined
        this.id =  v4()
        let tiles = [args.tileOne, args.tileTwo]
        args.tileOne.addSide(this, args.locOne)
        if(args.tileTwo) args.tileTwo.addSide(this, args.locTwo)

        this.setOwner = function(player) {
            this.owner = player.id
            this.color = player.color
            const one = tiles[0].checkOwner(this)
            let two = false
            if(tiles[1]) {
                two = tiles[1]?.checkOwner(this)
            }

            return [one, two]
        }
    }
}