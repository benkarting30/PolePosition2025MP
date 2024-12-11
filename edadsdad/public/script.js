// JavaScript source code
const socket = io({
    transports: ["Websocket"]
})

let player, otherPlayers, map, tracklimit, PlayerSensitivity = 3, endGame = false, slowed = false
function setup() {
    createCanvas(windowWidth, windowHeight)
    player = new Sprite()
    player.w = 12
    player.h = 8
    player.collider = 'd'
    player.x = width / 2
    player.y = height / 2

    otherPlayers = new Group()
    otherPlayers.w = 12
    otherPlayers.h = 8
    otherPlayers.collider = 'd'
    otherPlayers.x = height / 2
    otherPlayers.y = height / 2

    socket = io.connect();

}

function draw() {
    background(255)
    controls()
    player.draw()
    contactServer()
    socket.on("Update", (data) => {
        for (const id in data) {
            const dat = data[id];
            let vehicle = new otherPlayers.Sprite()
            vehicle.x = dat.x
            vehicle.y = dat.y
            vehicle.rotation = dat.rotation
        }
    })
}

function contactServer() {
    const data = {
        x: player.x,
        y: player.y,
        rotation: player.rotation
    }
    socket.emit("PlayerData", data)


}

function controls() {
    if (kb.pressing("w") && !endGame) {
        // Check if the player is slowed
        if (slowed) {
            // Increase player speed gradually up to a max of 1
            if (player.speed < 1) {
                player.speed += (20 / 120);
            }
        } else {
            if (player.speed < 3) {
                // Increase player speed gradually up to a max of 3
                player.speed += (45 / 120);
            }
        }
        // Set the player's direction to their current rotation
        player.direction = player.rotation;
    }

    // Check if 'S' key is being pressed
    if (kb.pressing("s")) {
        // If player speed is greater than 0, apply higher drag and friction and set direction to rotation
        if (player.speed > 0) {
            player.drag = 10;
            player.friction = 10;
            player.direction = player.rotation;
        } else if (player.speed <= 0) {
            // If player speed is 0 or less, set speed to -1, gear to "R", and remove drag and friction
            player.speed = -1;
            player.drag = 0;
            player.friction = 0;
        }
    } else {
        // If 'S' key is not pressed, apply default drag and friction
        player.drag = 5;
        player.friction = 5;
    }

    // Check if 'A' key is being pressed
    if (kb.pressing("a")) {
        // Rotate player to the left with understeer calculation and set direction to rotation
        player.rotate(UndersteerCalc(player.speed, -PlayerSensitivity, "Left"), PlayerSensitivity);
        player.direction = player.rotation;
    }

    // Check if 'D' key is being pressed
    if (kb.pressing("d")) {
        // Rotate player to the right with understeer calculation and set direction to rotation
        player.rotate(UndersteerCalc(player.speed, PlayerSensitivity, "Right"), PlayerSensitivity);
        player.direction = player.rotation;
    }

    // Check if 'Shift' key is being pressed and nitroTime is greater than 0
    if (kb.pressing('shift') && nitroTime > 0) {
        nitroActive = true;
    } else {
        // If 'Shift' key is not pressed or nitroTime is 0, deactivate nitro
        nitroActive = false;
    }



    if (kb.pressing("escape")) {
        escHeld = true;
        // Checks to see if the player has help esc for 3 seconds before telling the game to load the menu
        setTimeout(() => {
            if (escHeld) {
                window.sessionStorage.setItem("fastest", ttLaps)
                sessionComplete = true
            }
        }, 3000)

    } else {
        escHeld = false
    }


}
function UndersteerCalc(speed, sensitivity, direction = 'controller') {
    let turnSpeed, finalsensitivity
    if (speed > 1) {
        if (direction == "Left") {
            turnSpeed = -1 * abs(abs(sensitivity) - (speed - 1) / (6 - sensitivity))
            return turnSpeed
        } else if (direction == "Right") {
            turnSpeed = abs(abs(sensitivity) - (speed - 1) / (6 - sensitivity))
            return turnSpeed
        } else {
            turnSpeed = (abs(sensitivity) - (speed - 1) / sensitivity)
            return turnSpeed
        }
    } else {
        if (direction == "Left") {
            finalsensitivity = sensitivity
            return finalsensitivity
        } else {
            finalsensitivity = sensitivity
            return finalsensitivity
        }
    }
}