/*
Piers Rajguru
Final Project - Horse Racing Game
Mon April 29
*/

const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(
  path.resolve(__dirname, "public")
));



var http = require('http').Server(app);
var io = require('socket.io')(http);

//create an array to hold PLAYERS, similar to fruitsmashgameserver
class Player {

  constructor(login) {
    this.name = login;
    this.money = 200;
    this.horseBet = -1;
    this.betAmount = 0;
  }
}


class Players {
  constructor() {
    this.players = [];
  }
  add(player) {
    this.players.push(player);
  }
  remove(player) {
    this.players = this.players.filter((t) => t !== player);
  }
}

/*taken from fruitsmashgameserver */
function updateStatus() {
  const tmp = horseDerbyPlayers.players.map((t) => t)
  tmp.sort((a, b) => b.money - a.money);
  io.sockets.emit("playerslistupdate", tmp);
}

const horseDerbyPlayers = new Players();

io.on('connection', function (socket) { //handle the connection


  //LOGIN
  socket.on("login", (username) => { //login
    //verify username
    if ((username !== '') && (username != null) && ((typeof username) === "string")) {
      console.log("login received: " + username);
      //username already exists
      while (horseDerbyPlayers.players.find((t) => t.name === username)) {
        username += "*"; //add a star if already exists
      }
      const player = new Player(username);
      horseDerbyPlayers.add(player);
      updateStatus();
      socket.emit("loginresponse", {username:username, money:player.money});
    }
    else socket.emit("debug", `ERROR: loginname is not a valid username`);
  });

  //save betting information for each user
  socket.on("placeBet", (data) => {
    const player = horseDerbyPlayers.players.find((t) => t.name === data.name);
    if (player) {
      player.horseBet = data.betHorse;
      player.betAmount = data.betAmount;
      console.log(data.name + " placed bet: " + data.betAmount + " on horse " + data.betHorse);
    }

  });
  
  
  //update money
  socket.on("updateMoney", (data) => {
    //handle the money calculations here and then send to client
    //need to know the horse that won, the horse the user bet on, and the amount bet
    const player = horseDerbyPlayers.players.find((t) => t.name === data.name);
    if (player) {
      manageMoney(player,data.winner,socket);
      updateStatus();//update scoreboard
    }
  });

});

http.listen(3000, function () {
  console.log('Starting Horse Derby! - listening on *:3000');
});


//add double the money that the user bets 
//if they win, lose the money if you lose
function manageMoney(player, winner,socket) {
  //if the player wins
  if (player.horseBet == winner) {
    player.money += player.betAmount*2;
    socket.emit("receiveMoney",{money:player.money,updateMessage: " + $" + player.betAmount*2, color: "green"})

  }
  else { //player loses
    if (player.money >= player.betAmount) { //player has sufficient money
      player.money -= player.betAmount;
      socket.emit("receiveMoney",{money:player.money,updateMessage: "- $" + player.betAmount, color: "red"});
    }
    else { //player has no more money
      player.money = 0;
      socket.emit("receiveMoney",{money:player.money,updateMessage: ""});
    }
  }
}

