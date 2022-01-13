let player = {}

const url = 'wss://y058hf1z.anyfiddle.run'
const connection = new WebSocket(url)

connection.onopen = () => {
    console.log("connected")
}

connection.onmessage = (message) => {
    const data = JSON.parse(message.data)
    console.log(data)
    switch(data.type){
        case "self":
            player = data.data
            player.lastMove = new Date(data.data.lastMove)
            $("#playerName").val(data.data.name)
            break
        case "newPlayer":
            let newPlayer = data.data
            addPlayer(newPlayer)
            break
        case "nameChange":
            console.log($(`[data-playerId="${data.data.id}"] .name`).text())
            $(`[data-playerId="${data.data.id}"] .name`).text(data.data.name)
            break
        case "move":
            $(`[data-sideId="${data.side}"]`).css("background-color",`hsl(${data.color}, 50%, 50%)`)
            $(`[data-sideId="${data.side}"]`).off('click')
            $(`[data-sideId="${data.side}"]`).off('hover')
            $(`[data-sideId="${data.side}"]`).removeClass( "hoverbg" );
            break
        case "scoreUpdate":
            $(`#${data.x}_${data.y}`).css("background-color",`hsl(${data.color}, 50%, 50%)`)
            $(`[data-playerId="${data.id}"] .score`).text(data.score)
            break
        case "timer":
            player.lastMove = new Date(data.now)
            break
    }
}

function createBoard(boardSize) {
    for(var i = 0; i < boardSize; i++) {
        let row = $('<tr></tr>').appendTo("#board")
        for(var j = 0; j< boardSize; j++) {
            $( "<td style='width:10px; height: 10px; background-color: black;'></td>").appendTo(row)
            $(`<td style='width:30px; height: 10px; background-color: gray;' id='${i}_${j}_top' class='hover'></td>`).appendTo(row)
        }
        $( "<td style='width:10px; height: 10px; background-color: black;'></td>").appendTo(row)
        row = $('<tr></tr>').appendTo("#board")
        for(var j = 0; j< boardSize; j++) {
            $(`<td style='width:10px; height: 30px; background-color: gray;' id='${i}_${j}_side' class='hover'></td>`).appendTo(row)
            $( `<td style='width:30px; height: 30px' id='${i}_${j}'></td>`).appendTo(row)
        }
        $(`<td style='width:10px; height: 30px; background-color: gray;' id='${i}_${boardSize}_side' class='hover'></td>`).appendTo(row)
    }
    let row = $('<tr></tr>').appendTo("#board")
    for(var j = 0; j< boardSize; j++) {
        $( "<td style='width:10px; height: 10px; background-color: black;'></td>").appendTo(row)
        $(`<td style='width:30px; height: 10px; background-color: gray;' id='${boardSize}_${j}_top' class='hover'></td>`).appendTo(row)
    }
    $( "<td style='width:10px; height: 10px; background-color: black;'></td>").appendTo(row)
}

function sendClick() {
    connection.send(JSON.stringify({type: "move", side: $("#"+this.id).attr("data-sideId")}))
}

function addPlayer(newPlayer){
    if($(`[data-playerId="${newPlayer.id}"]`).length === 0){
        let elem = document.createElement("li")
        $(elem).css("color",`hsl(${newPlayer.color}, 50%, 50%)`)
        $(elem).attr("data-playerId", newPlayer.id)
        $(elem).html(`<span class='name'>${newPlayer.name}</span>: <span class="score">${newPlayer.score}</span>`)
        $("#playerList").append(elem)
    }
}

function addGameData(data) {
    data.forEach((row, i) => {
        row.forEach((tile, j) => {
            if(tile.owner) {
                $(`#${tile.x}_${tile.y}`).css("background-color",`hsl(${tile.color}, 50%, 50%)`)
            }
            if(tile.sides.top){
                $(`#${i}_${j}_top`).attr("data-sideId", tile.sides.top.id)
                if(tile.sides.top.owner) {
                    $(`#${i}_${j}_top`).css("background-color",`hsl(${tile.sides.top.color}, 50%, 50%)`)
                    $(`#${i}_${j}_top`).removeClass( "hover" );
                }
            }
            if(tile.sides.bottom)
            {
                $(`#${i+1}_${j}_top`).attr("data-sideId", tile.sides.bottom.id)
                if(tile.sides.bottom.owner) {
                    $(`#${i}_${j}_top`).css("background-color",`hsl(${tile.sides.bottom.color}, 50%, 50%)`)
                    $(`#${i}_${j}_top`).removeClass( "hover" )
                }
            }
            if(tile.sides.left){
                $(`#${i}_${j}_side`).attr("data-sideId", tile.sides.left.id)

                if(tile.sides.left.owner) {
                    $(`#${i}_${j}_side`).css("background-color",`hsl(${tile.sides.left.color}, 50%, 50%)`)
                    $(`#${i}_${j}_side`).removeClass( "hover" )
                }
            }
            if(tile.sides.right)
            {
                $(`#${i}_${j+1}_side`).attr("data-sideId", tile.sides.right.id)
                if(tile.sides.right.owner) {
                    $(`#${i}_${j}_side`).css("background-color",`hsl(${tile.sides.right.color}, 50%, 50%)`)
                    $(`#${i}_${j}_side`).removeClass( "hover" )
                }
            }
        })
    })
}


$(document).ready(() => {
    $.ajax({
        url: "/size",
        type: "GET"
    }).done(function(data) {
        createBoard(data)
        $(".hover").hover(function() {
            $( this ).addClass( "hoverbg" );
        }, function() {
            $( this ).removeClass( "hoverbg" );
        })

        $.ajax({
            url: "/game",
            type: "GET"
        }).done(function(data) {
            addGameData(data)
            $(".hover").on('click', sendClick)
        });
    });

    $.ajax({
        url: "/player",
        type: "GET"
    }).done(function(data) {
        data.forEach(value => addPlayer(value))
    });

    $("#changeName").click(() => {
        if(player.name !== $("#playerName").val()){
            console.log("changeName")
            connection.send(JSON.stringify({type: "nameChange", name: $("#playerName").val()}))
        }
    })

    let timeCheck = setInterval(function() {
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = now - player.lastMove

        // Time calculations for days, hours, minutes and seconds
        var seconds = 10 - Math.ceil((distance % (1000 * 60)) / 1000)

        if (seconds < 0) {
            $("#timer").text(0)
            $("#message").removeClass("alert-primary")
            $("#message").addClass("alert-success")
        }
        else {
            $("#timer").text(seconds)
            $("#message").addClass("alert-primary")
            $("#message").removeClass("alert-success")
        }
    }, 1000)
})