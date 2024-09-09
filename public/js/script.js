/*
Piers Rajguru
CSE 264 final Project
Horse Racing Game
April 30th 2024
*/

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 700;
canvas.height = 400;

//just for now will make better later

function drawGrass() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 70;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(finishLineImage, canvas.width - 40, 0, 40, canvas.height);

}

//GLOBAL VARIABLES ----------------

//array to hold the images
let horseArray = [];
let money = 200;
let horseName = ["Blue", "Green", "Red", "Yellow", "Purple"]; //to associate number with color
//will have numbers associated with each image
// 0 = blue, 1 = yellow, 2 = red, 3 = green, 4 = purple
const imageFiles = [
    'images/blueHorse.png',
    'images/greenHorse.png',
    'images/redHorse.png',
    'images/yellowHorse.png',
    'images/purpleHorse.png',
    'images/finishLine.png', //loading the finishline image
];

let raceStarted = false;
let raceWinner = -1;
let raceEnded = false;
let username = "";

let betHorse = 0;
let betAmount = 0;

let finishLineImage;




//taken from prog7
function loadImages(imagePaths) {
    // Function to load a single image
    function loadImage(path) {
        return new Promise(function (resolve, reject) {
            const img = new Image();
            img.src = path;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image from ${path}`));
        });
    }
    // Array of promises to load all images
    const promises = imagePaths.map(loadImage);

    // Using Promise.all to wait for all images to be loaded
    return Promise.all(promises); //
}

loadImages(imageFiles).then(images => {
    //console.log('All images loaded!', images);
    createHorses(images) //save as global
    finishLineImage = images[images.length - 1];
    console.log('All images loaded!', images);
    displayRace();
    //  can now use the 'images' array to draw on a canvas
}).catch(error => {
    console.error('Error loading one or more images:', error);
});

//initialize horse objects array
function createHorses(images) {
    for (let i = 0; i < images.length - 1; i++) {
        //Horse (image,x,y,speed, num);
        horseArray.push({ image: images[i], x: 0, y: 0, speed: 0, horseNum: i });
    }

}


function displayRace() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear before redrawing
    drawGrass();
    let spacing = canvas.height / horseArray.length;
    for (horse of horseArray) {
        //make it stationary till clicked go
        if (raceStarted) {
            //generate random num between 1 and 2, then generate speed with more variabil
            let num = Math.floor((Math.random() * 2) + 1); // This will now correctly generate either 1 or 2
            if (num === 1) {
                // generate num between 0 and 1
                horse.speed = Math.random();
            } else {
                // generate between 2 and 3
                horse.speed = Math.random() + 2;
            }
        }
        horse.y = spacing * horseArray.indexOf(horse);
        // a horse WINS
        if (horse.x + 120 > canvas.width) {
            horse.speed = 0;
            if (raceWinner == -1) { //if no winner yet, this horse won
                raceWinner = horse.horseNum;
                raceEnded = true;
                document.getElementById("winner-box").innerHTML = horseName[raceWinner] + " Horse " + " won!";
                handleMoney(); //update money
                raceEnded = false; //
            }
        }
        horse.x += horse.speed; //change pos
        ctx.drawImage(horse.image, horse.x, horse.y, 80, 80);
    }
    requestAnimationFrame(displayRace); //animate the horses
}

//make socket connection
let socket = io();

//LOGIN ------------
let loginButton = document.getElementById("loginbutton");
loginButton.addEventListener("click", function () {
    // get the text input
    let text = document.getElementById("login").value;
    socket.emit("login", text);
    console.log("username sent to server");
});


//RECIEVE LOGIN RESPONSE -----------
socket.on('loginresponse', function (data) {
    username = data.username;
    document.getElementById("titlebar").innerHTML = "Horse Derby:  " + username; //change titlebar
    money = data.money;
    document.getElementById("money").innerHTML = money;
    let showMoneyChange = document.getElementById("change-money"); //add money to user
    showMoneyChange.innerHTML = "";

});


//BET BUTTON ---------Starting race and submitting bets
let Betbutton = document.getElementById("bet-button");
Betbutton.addEventListener("click", function () {
    betAmount = document.getElementById("amount-input").value;
    betHorse = document.getElementById("select-horse").value;
    //validate inputs
    if (username !== "" && betAmount !== "" && betAmount <= money && betAmount > 0) {
        for (horse of horseArray) {
            horse.x = 0;
        }
        raceStarted = true; //begin race
        raceWinner = -1; //reset winner
        raceEnded = false;
        socket.emit("placeBet", { name: username, betAmount: betAmount, betHorse: betHorse }); //send bet to server
        console.log("Bet placed: $" + betAmount + " on the " + horseName[betHorse] + " horse");
        document.getElementById("winner-box").innerHTML = "Bet placed: " + betAmount + " on the " + horseName[betHorse] + " horse";
    }

    else {
        alert("Please login first and/or enter a valid bet amount!");
    }

});

//RECIEVE MONEY AMOUNT TO DISPLAY-----------
socket.on("receiveMoney", (data) => {
    money = data.money;
    document.getElementById("money").innerHTML = money;
    let showMoneyChange = document.getElementById("change-money");
    if (money == 0) {
        console.log("Race ended= " + raceEnded);
        alert("You have lost all your money! Please login again to play!")
    }
    else {
        showMoneyChange.innerHTML = data.updateMessage;
    }
    showMoneyChange.style.color = data.color;
});

//Send the winner horse to server to udpate money -----------
function handleMoney() {
    if (raceEnded) {
        socket.emit("updateMoney", { name: username, money: money, winner: raceWinner });
    }




}







//RECIEVE PLAYER LIST -----------
socket.on('playerslistupdate', function (data) {
    displayPlayerList(data);
});





function displayPlayerList(plist) {
    let playerList = document.getElementById("tablebody");
    playerList.innerHTML = "";
    for (let i = 0; i < plist.length; i++) {
        let row = playerList.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        cell1.innerHTML = plist[i].name;
        cell2.innerHTML = plist[i].money;
    }
}

socket.on("debug", (mess) => console.log(mess));






//what needs to be done
//move horses across the screen once user clicks, place bet
//handle the username in a way, send to server potentially
//display the winner of the race, then reset game again, changing the users money, allow them to replay
//ill begin by handling the inputs on client side
//

//what server needs
// - username
// - bet amount and horse
//- SEND the updated player list
//- SEND the horse object probably, with x,y

//look at past socket examples to see what app.js looks like





