var cvs = document.getElementById("flappy_canvas");
var ctx = cvs.getContext("2d");

// load images
let gameState = "running";

var bird = new Image();
var bg = new Image();
var fg = new Image();
var pipeNorth = new Image();
var pipeSouth = new Image();

bird.src = "images/bird.png";
bg.src = "images/bg.png";
fg.src = "images/fg.png";
pipeNorth.src = "images/pipeNorth.png";
pipeSouth.src = "images/pipeSouth.png";
var pipeNorthHeight = 242;
var pipeSouthHeight = 378;
var pipeWidth = 52;
var fgHeight = 118;
var fgWidth = 306;
// some variables

var gap = 85;
var game_height = 512;

var x_gap = 150;
var start_gap = 150;

var bX, bY;


var score = 0;
// on key down

// document.addEventListener("keydown", moveUp);

// function moveUp() {
//     bY -= 25;
// }
let pipeIdx = 0;
function random_pipe_height() {
    // pipeIdx++;
    // if (pipeIdx < 3) {
    //     return Math.floor(((pipeIdx-1) * 0.9 + 0.1) * pipeNorthHeight) - pipeNorthHeight
    // }
    return Math.floor((Math.random()  * 0.9 + 0.1)* pipeNorthHeight) - pipeNorthHeight
}

// pipe coordinates

var pipe = [];

function init_pipes() {
    pipe = []
    // make 20 pipes spaced with gaps
    for (var i = 0; i < 20; i++) {
        pipe[i] = {
            x: i * x_gap + start_gap,
            y: random_pipe_height()
        };
    }
}
// draw images
const y_forgiveness = 0.5;

function draw() {
    // clear screen
    ctx.clearRect(0, 0, cvs.width + 20, cvs.height);
    // ctx.drawImage(bg, 0, 0);
    if (gameState == "running") {
        if (pipe[0].x < -50) {
            pipe.shift();
            pipe.push({
                x: pipe[pipe.length - 1].x + x_gap,
                y: random_pipe_height()
            });
            score += 1;
        }
    }

    for (var i = 0; i < pipe.length; i++) {

        // constant = pipeNorth.height + gap;
        // console.log(pipeNorth.height, gap, constant) // 242 85 327
        // console.log(pipeSouth.width, gap, constant) // 242 85 327

        ctx.drawImage(pipeNorth, pipe[i].x, pipe[i].y);
        ctx.drawImage(pipeSouth, pipe[i].x, pipe[i].y + pipeNorthHeight + gap);
        if (gameState == "running") {
            pipe[i].x -= 0.75 * (is_hard_value+1)

            let x_overlap = bX + bird.width  >= pipe[i].x && bX + 0.4 * bird.width <= pipe[i].x + pipeWidth;
            let y_top_overlap = bY + bird.height * y_forgiveness <= pipe[i].y + pipeNorthHeight;
            let y_bottom_overlap = bY + bird.height * (1-y_forgiveness) >= pipe[i].y + pipeNorthHeight+ gap;
            // detect collision
            // if (i == 0) console.log( y_top_overlap, y_bottom_overlap);
            if (x_overlap && (y_top_overlap || y_bottom_overlap)
            ) {
                // location.reload(); // reload the page
                gameState = "over";
                setTimeout(restartGame, 1000);
                break;
            }
            // if (bY + bird.height >= cvs.height - fg.height) {
            //     console.log("out of bounds");
            // }

        }

    }  
    // rect around bird
    ctx.beginPath();
    ctx.rect(bX, bY, bird.width, bird.height);
    ctx.stroke();



    for (var i = 0; i * fgWidth <= cvs.width; i++) {
        ctx.drawImage(fg, i * fgWidth, game_height - fgHeight);
    }
    // ctx.drawImage(fg, 0, game_height - fg.height);


    ctx.drawImage(bird, bX, bY);
    if (gameState == "running") {

    }
    ctx.fillStyle = "#000";
    ctx.font = "20px Verdana";
    ctx.fillText("Score : " + score, 10, game_height - 20);

    requestAnimationFrame(draw);

}
function restartGame() {
    init_pipes()
    bX = 10;
    bY = 200;
    score = 0;
    gameState = "running";
}
restartGame()
window.startGame = draw;
window.moveBird = function (y) {
    if (gameState == "running") {
        bY = y * game_height;
        if (bY >= game_height - fgHeight - 40) {
            bY = game_height - fgHeight - 40;
        }
    }
}

window.setSize = function (width, height) {
    cvs.style.scale = height / game_height;
    cvs.width = width / cvs.style.scale;
}

















let is_hard_value = false;
window.addEventListener("DOMContentLoaded", function () {
  let hard_toggle = document.getElementById("hard");
  let hard_toggle_label = document.getElementById("hard-label");
  console.log(hard_toggle);
  const hard_toggled = () => {
    hard_toggle_label.innerText = !hard_toggle.checked ? "Easy" : "Hard";
    is_hard_value = hard_toggle.checked;
    let urlParams = new URLSearchParams(window.location.search);
    urlParams.set('hard', is_hard_value);
    window.history.pushState({}, '', '?' + urlParams.toString());

  }
  hard_toggle.addEventListener("change", hard_toggled);
  // get start value from query string
  let urlParams = new URLSearchParams(window.location.search);
  is_hard_value = urlParams.get('hard');
  hard_toggle.checked = is_hard_value == "true";
  hard_toggled()
})