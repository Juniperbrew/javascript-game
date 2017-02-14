// Main structure from https://www.sitepoint.com/quick-tip-game-loop-in-javascript/

$(document).ready(function () {
    "use strict";

    var WIDTH = 800;
    var HEIGHT = 600;
    var HEIGHT_STATUS = document.getElementById("statusPane").clientHeight+20;
    var canvas = document.getElementById("gameCanvas");
    var ctx = canvas.getContext("2d");
    var lastRender = 0;
    var speed = 0.25;

    /*
    * GAME STATE
    */
    var state = {
        x: WIDTH / 2,
        y: HEIGHT / 2,
        score: 0
    };
    var pressedKeys = {
        left: false,
        right: false,
        up: false,
        down: false,
        addScore: false
    };

    /*
    * INIT RENDERING
    */
    canvas.height = HEIGHT;
    canvas.width = WIDTH;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Request the service to set the resolution of the
    // iframe correspondingly
    var message = {
        messageType: "SETTING",
        options: {
            "width": WIDTH,
            "height": HEIGHT+HEIGHT_STATUS
        }
    };
    window.parent.postMessage(message, "*");

    /*
    * INPUT
    */

    // WASD
    var keyMap = {
        68: 'right',    //D
        65: 'left',     //A
        87: 'up',       //W
        83: 'down',     //S
        69: 'addScore'  //E
    }
    function keydown(event) {
        var key = keyMap[event.keyCode]
        pressedKeys[key] = true
    }
    function keyup(event) {
        var key = keyMap[event.keyCode]
        pressedKeys[key] = false
    }

    window.addEventListener("keydown", keydown, false)
    window.addEventListener("keyup", keyup, false)

    /*
    * GAME LOGIC
    */
    function mainLoop(timestamp) {
        var delta = timestamp - lastRender;

        update(delta)
        draw()

        lastRender = timestamp
        window.requestAnimationFrame(mainLoop)
    }
    window.requestAnimationFrame(mainLoop)

    function update(delta) {
        delta *= speed;
        if (pressedKeys.left) {
            state.x -= delta;
        }
        if (pressedKeys.right) {
            state.x += delta;
        }
        if (pressedKeys.up) {
            state.y -= delta;
        }
        if (pressedKeys.down) {
            state.y += delta;
        }

        if (state.x > WIDTH) {
            state.x = WIDTH;
        }
        else if (state.x < 0) {
            state.x = 0;
        }
        if (state.y > HEIGHT) {
            state.y = HEIGHT;
        }
        else if (state.y < 0) {
            state.y = 0;
        }

        if (pressedKeys.addScore) {
            state.score++;
            document.getElementById("scoreDisplay").innerHTML = state.score;
        }
    }

    function draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "yellow";
        ctx.fillRect(state.x - 5, state.y - 5, 10, 10);
    }

    /*
    * MESSAGE HANDLING
    */

    // SCORE
    $("#submit_score").click(function () {
        var msg = {
            "messageType": "SCORE",
            "score": state.score
        };
        window.parent.postMessage(msg, "*");
    });

    // SAVE
    $("#save").click(function () {
        var msg = {
            "messageType": "SAVE",
            "gameState": state
        };
        window.parent.postMessage(msg, "*");
    });

    // LOAD_REQUEST
    $("#load").click(function () {
        var msg = {
            "messageType": "LOAD_REQUEST",
        };
        window.parent.postMessage(msg, "*");
    });

    // LOAD
    window.addEventListener("message", function (evt) {
        if (evt.data.messageType === "LOAD") {
            state = evt.data.gameState;
            document.getElementById("scoreDisplay").innerHTML = state.score;
        } else if (evt.data.messageType === "ERROR") {
            alert(evt.data.info);
        }
    });
});