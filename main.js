function init() {
    // check screen size. If it's less than 400 square, don't allow it.
    resizeCanvas(document.getElementById("mainGameCanvas"));
    initListeners();
    initGlobalVariables();
    window.requestAnimationFrame(initGameLoop);
    initMine();
    updateDisplayedQty();
}

function initGlobalVariables() {
    window.gameData = {
        canvas: document.getElementById("mainGameCanvas"),
        ctx: document.getElementById("mainGameCanvas").getContext('2d'),
        mine: [],
        mineSize: {width: 100, height: 100},
        blockTypeMap: {
            empty: {probability: 0, color: '#eeeeee', hardness: 100, value: 0},
            dirt: {probability: 20, color: '#654321', hardness: 500, value: 0},
            coal: {probability: 20, color: '#222222', hardness: 1500, value: 5},
            stone: {probability: 50, color: '#555555', hardness: 1000, value: 0},
            iron: {probability: 10, color: '#ed8f1c', hardness: 2500, value: 10},
            diamond: {probability: 1, color: '#9cc2ff', hardness: 5000, value: 50}
            },
        playerData: {inventory: {gas: 500}, x: 50, y:-1, speed: 1, color: "#2988a0", playerDrawX: Math.floor(document.getElementById("mainGameCanvas").width/2), playerDrawY: Math.floor(document.getElementById("mainGameCanvas").height/2)},
        playerMoving: {started: 0, direction: undefined, currentMove: undefined},
        mineData: {blockWidth: 100},
        groundHeight: 300,
        viewportCenter: {x: 50, y: 2}
    };
    // TODO: save game data to the local storage;
}

function initMine() {
    let mineArray = [];
    let blockTypeArray = [];
    let averageFrom = 0;
    // get array of block types
    for(const block in window.gameData.blockTypeMap) {
        blockTypeArray.push(block);
        averageFrom += gameData.blockTypeMap[block].probability;
    }
    for(let i = 0; i < window.gameData.mineSize.width; i++) {
        let mineRow = [];
        for(let q = 0; q < window.gameData.mineSize.height; q++) {
            let randValue = Math.floor(Math.random() * averageFrom);
            let counter = 0;
            let blockType = 'stone';
            for(let j = 0; j < blockTypeArray.length; j++) {
                counter += gameData.blockTypeMap[blockTypeArray[j]].probability;
                if (randValue < counter) {
                    blockType = blockTypeArray[j];
                    break;
                }
            }

            mineRow.push({blockType: blockType, isMined: false});
        }
        mineArray.push(mineRow);
    }
    window.gameData.mine = mineArray;
}

function initListeners() {
    window.addEventListener("resize", function() {
        resizeCanvas(document.getElementById("mainGameCanvas"))
    })
    document.onkeydown = checkKeyDown;
    document.onkeyup = checkKeyUp;
}

function checkKeyDown(e) {
    e = e || window.event;
    if(!window.gameData.playerMoving.started) {
        window.gameData.playerMoving.started = Date.now();
    }


    if (e.code === 'ArrowUp') {
        // up arrow
        window.gameData.playerMoving.direction = {x:0, y:-1}
        console.log("up")
    }
    else if (e.code === 'ArrowDown') {
        // down arrow
        window.gameData.playerMoving.direction = {x:0, y:1}
    }
    else if (e.code === 'ArrowLeft') {
        // left arrow
        window.gameData.playerMoving.direction = {x:-1, y:0}
    }
    else if (e.code === 'ArrowRight') {
        // right arrow
        window.gameData.playerMoving.direction = {x:1, y:0}
    }
}

function checkKeyUp(e) {
    window.gameData.playerMoving.started = undefined;
}

function movePlayer(x, y) {
    let player = window.gameData.playerData;
    let potentialPosition ={x: player.x + x, y: player.y + y};
    // check if they are moving above ground
    if(potentialPosition.y < 0) {
        potentialPosition.y = -1; // prevent them from moving up above -1
        window.gameData.playerData.x = potentialPosition.x;
        window.gameData.playerData.y = potentialPosition.y;
    } else {
        const blockType = window.gameData.mine[potentialPosition.y][potentialPosition.x].blockType;
        const gasAfterMove = gameData.playerData.inventory.gas - gameData.blockTypeMap[blockType].hardness / 100;
        if(gasAfterMove >= 0 || gameData.playerData.y < 0) {
            window.gameData.playerData.x = potentialPosition.x;
            window.gameData.playerData.y = potentialPosition.y;
            window.gameData.mine[potentialPosition.y][potentialPosition.x].blockType = 'empty';
            if (window.gameData.playerData.inventory[blockType] !== undefined) {
                window.gameData.playerData.inventory[blockType]++;
            } else {
                window.gameData.playerData.inventory[blockType] = 1;
            }
            updateDisplayedQty();
            gameData.playerData.inventory.gas = gasAfterMove;
        } else {
            // you died
            // alert("you died")
        }
    }
}

function updateDisplayedQty() {
    const gasDisplay = document.querySelector(".navbar .gas .inventory-qty");
    const dirtDisplay = document.querySelector(".navbar .dirt .inventory-qty");
    const stoneDisplay = document.querySelector(".navbar .stone .inventory-qty");
    const coalDisplay = document.querySelector(".navbar .coal .inventory-qty");
    const ironDisplay = document.querySelector(".navbar .iron .inventory-qty");
    const diamondDisplay = document.querySelector(".navbar .diamond .inventory-qty");

    gasDisplay.innerHTML = gameData.playerData.inventory.gas ?? 0;
    dirtDisplay.innerHTML = gameData.playerData.inventory.dirt ?? 0;
    stoneDisplay.innerHTML = gameData.playerData.inventory.stone ?? 0;
    coalDisplay.innerHTML = gameData.playerData.inventory.coal ?? 0;
    ironDisplay.innerHTML = gameData.playerData.inventory.iron ?? 0;
    diamondDisplay.innerHTML = gameData.playerData.inventory.diamond ?? 0;
}

function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawSquare(data) {
    if(data.color) {
        window.gameData.ctx.fillStyle = data.color;
    }
    window.gameData.ctx.fillRect(data.x, data.y, data.width, data.height);
}

function drawCircle(data) {
    window.gameData.ctx.beginPath();
    window.gameData.ctx.arc(data.x, data.y, data.r, 0, Math.PI * 2, true); // Outer circle
    if(data.color) {
        window.gameData.ctx.fillStyle = data.color;
    }
    window.gameData.ctx.fill();
}

function drawPlayer() {
    let playerData = window.gameData.playerData;
    const blockWidth = window.gameData.mineData.blockWidth

    drawCircle({x:playerData.playerDrawX, y:playerData.playerDrawY, r: (blockWidth/2), color: playerData.color})
}

function calculatePlayerMove() {
    let moveStartTime = window.gameData.playerMoving.started;
    if(moveStartTime) {
        // check which block they're moving to.
        let nextBlockX = gameData.playerData.x + gameData.playerMoving.direction.x;
        let nextBlockY = gameData.playerData.y + gameData.playerMoving.direction.y;
        // check if you're above ground
        if(nextBlockY < 0) {
            // they're moving above ground
            nextBlockY = -1;
            if(Date.now() - moveStartTime >= 200) {
                movePlayer(window.gameData.playerMoving.direction.x, -1);
                window.gameData.playerMoving.started = Date.now();
                // TODO: add a loader to show how far they've mined into that block. Eventually I should actually move them little bits.
            }

        } else {
            // they're moving underground
            let nextBlock = gameData.blockTypeMap[gameData.mine[nextBlockY][nextBlockX].blockType];
            // check if they've been moving long enough
            if(Date.now() - moveStartTime >= nextBlock.hardness) {
                movePlayer(window.gameData.playerMoving.direction.x, window.gameData.playerMoving.direction.y);
                window.gameData.playerMoving.started = Date.now();
                // TODO: add a loader to show how far they've mined into that block. Eventually I should actually move them little bits.
            }
        }



    }
}

function drawMine() {
    const numberHorizontal = Math.ceil((window.gameData.canvas.width/window.gameData.mineData.blockWidth) + 3);
    const numberVertical = Math.ceil((window.gameData.canvas.height/window.gameData.mineData.blockWidth) + 3);
    const blockWidth = window.gameData.mineData.blockWidth;
    const playerPosX = window.gameData.playerData.x
    const playerPosY = window.gameData.playerData.y
    const playerBlockX = window.gameData.playerData.playerDrawX - (blockWidth/2);
    const playerBlockY = window.gameData.playerData.playerDrawY - (blockWidth/2);
    const numberBeforePlayer = Math.floor(numberHorizontal / 2)
    const numberAbovePlayer = Math.floor(numberVertical / 2)
    const leftPosition = playerPosX - numberBeforePlayer;
    const topPosition = playerPosY - numberAbovePlayer;
    const firstDrawX = playerBlockX - (numberBeforePlayer * blockWidth)
    const firstDrawY = playerBlockY - (numberAbovePlayer * blockWidth)

    // if(topPosition < 0) {
    //     // pass
    // }

    for(let i = 0; i < numberVertical; i++) {
        for(let q = 0; q < numberHorizontal; q++) {
            if(i + topPosition > -1) {
                let blockData = window.gameData.blockTypeMap[window.gameData.mine[i + topPosition][q + leftPosition].blockType];
                let drawX = firstDrawX + q*blockWidth + 1;
                let drawY = firstDrawY + i*blockWidth + 1;
                if(!window.gameData.mine[i + topPosition][q + leftPosition].isMined) {
                    drawSquare({x: drawX, y: drawY, width: blockWidth - 2, height: blockWidth - 2, color: blockData.color});
                }
            }
        }
    }
}

function initGameLoop(timestamp) {
    // do some stuff
    window.gameData.ctx.clearRect(0, 0, window.gameData.canvas.width, window.gameData.canvas.height);
    drawMine();
    calculatePlayerMove();
    drawPlayer();
    window.requestAnimationFrame(initGameLoop)
}

init()
