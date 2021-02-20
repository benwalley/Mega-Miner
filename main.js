// TODO add multiplier (silk touch)


// UTILITY CLASSES


function drawPlayer() {
    let playerData = window.gameData.playerData;
    const blockWidth = window.gameData.mineData.blockWidth

    drawCircle({x:playerData.playerDrawX, y:playerData.playerDrawY, r: (blockWidth/2), color: gameData.drillBitLevels[gameData.playerData.speed % gameData.drillBitLevels.length]})

    // draw version number
    gameData.ctx.font = '20px serif';
    gameData.ctx.fillStyle = "#333333";
    gameData.ctx.fillText('V' + gameData.playerData.speed, gameData.playerData.playerDrawX - 13, gameData.playerData.playerDrawY + 7);

    let moveStartTime = window.gameData.playerMoving.started;

    // If the player is moving, draw loading circle
    if(moveStartTime) {
        let nextBlockX = gameData.playerData.x + gameData.playerMoving.direction.x;
        let nextBlockY = gameData.playerData.y + gameData.playerMoving.direction.y;
        let nextBlock = nextBlockY < 0 ? gameData.blockTypeMap['empty'] : gameData.blockTypeMap[gameData.mine[nextBlockY][nextBlockX].blockType];
        const totalTime = nextBlock.hardness / gameData.playerData.speed;
        const elapsedTime = Date.now() - moveStartTime;
        let angle = (Math.PI * 2 / totalTime) * elapsedTime;
        gameData.ctx.beginPath();
        gameData.ctx.arc(gameData.playerData.playerDrawX, gameData.playerData.playerDrawY, 20, 0, angle);
        gameData.ctx.strokeStyle = "#ffffff";
        gameData.ctx.stroke();
    }
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
        const gasAfterMove = gameData.playerData.gas - gameData.blockTypeMap[blockType].gasUsed;

        if(gasAfterMove >= 0 || gameData.playerData.y < 0) {
            window.gameData.playerData.x = potentialPosition.x;
            window.gameData.playerData.y = potentialPosition.y;
            window.gameData.mine[potentialPosition.y][potentialPosition.x].blockType = 'empty';
            // only add item if your inventory can hold it
            if(gameData.playerData.currentCargo < gameData.playerData.maxCargo) {
                // if you have that item in your inventory
                if (window.gameData.playerData.inventory[blockType] !== undefined) {
                    window.gameData.playerData.inventory[blockType]++;
                } else {
                    window.gameData.playerData.inventory[blockType] = 1;
                }
            } else {
                if(blockType !== "dirt" && blockType !== "stone" && blockType !== "empty") {
                    informationalMessage("You can't hold that much cargo", 1000);
                }
            }

            updateDisplayedQty();
            gameData.playerData.gas = gasAfterMove;
        } else if(gasAfterMove <= 0 && blockType !== "bedrock") {
            informationalMessage("you don't have enough gas to mine that block")
        }
    }

    cargoMeter();
    depthometer();
    makeBlocksVisibleAround(potentialPosition.x, potentialPosition.y);
}

function makeBlocksVisibleAround(x, y) {
    // Make blocks Visible around you.
    let distance = gameData.playerData.radarDistance;
    for(var i = 0; i <= distance; i++) {
        for (var q = 0; q <= distance; q++) {
            try {gameData.mine[y - q][x - i].isVisible = true} catch(e) {}
            try {gameData.mine[y - q][x + i].isVisible = true} catch(e) {}
            try {gameData.mine[y + q][x - i].isVisible = true} catch(e) {}
            try {gameData.mine[y + q][x + i].isVisible = true} catch(e) {}
        }
    }
}

function handleRestartSave() {
    document.querySelector(".controls-button.restart").addEventListener("click", function() {
        init(true);
    })

    // handle save
    document.querySelector(".controls-button.save").addEventListener("click", function() {
        let jsonSettings = JSON.stringify(gameData);
        localStorage.setItem('megaMiner', jsonSettings);
    })
}

function drawMine() {
    const numberHorizontal = Math.ceil((window.gameData.canvas.width/window.gameData.mineData.blockWidth) + 3);
    const numberVertical = Math.ceil((window.gameData.canvas.height/window.gameData.mineData.blockWidth) + 3);
    const blockWidth = window.gameData.mineData.blockWidth;
    let playerPosX = window.gameData.playerData.x
    let playerPosY = window.gameData.playerData.y
    let playerBlockX = window.gameData.playerData.playerDrawX - (blockWidth/2);
    let playerBlockY = window.gameData.playerData.playerDrawY - (blockWidth/2);
    let numberBeforePlayer = Math.floor(numberHorizontal / 2)
    let numberAbovePlayer = Math.floor(numberVertical / 2)
    let leftPosition = playerPosX - numberBeforePlayer;
    let topPosition = playerPosY - numberAbovePlayer;
    let firstDrawX = playerBlockX - (numberBeforePlayer * blockWidth)
    let firstDrawY = playerBlockY - (numberAbovePlayer * blockWidth)
    const numberToAddToMine = 20;

    // check if you're too far to one side
    // if so, either stop, or add to the array
    // ========================================
    // Check your position, and see if you need to add more block
    //=========================================
    if(playerPosX + numberBeforePlayer >= gameData.mineSize.width) {
        // add to end of mine
        for (var i = 0; i < gameData.mineSize.height; i++) {
            for (var q = 0; q < numberToAddToMine; q++) {
                gameData.mine[i].push({blockType: getRandomBlock(i), isMined: false, isVisible: i === 0});
            }
        }
        gameData.mineSize.width += numberToAddToMine;
    } else if (leftPosition < 0) {
        // add to beginning of mine
        for (var i = 0; i < gameData.mineSize.height; i++) {
            for (var q = 0; q < numberToAddToMine; q++) {
                gameData.mine[i].unshift({blockType: getRandomBlock(i), isMined: false, isVisible: i === 0});
            }
        }
        gameData.startingPosition.x += numberToAddToMine;
        gameData.mineSize.width += numberToAddToMine;
        // move current position
        gameData.playerData.x += numberToAddToMine;
        // recalculate variables
        playerPosX = window.gameData.playerData.x
        playerPosY = window.gameData.playerData.y
        playerBlockX = window.gameData.playerData.playerDrawX - (blockWidth/2);
        playerBlockY = window.gameData.playerData.playerDrawY - (blockWidth/2);
        numberBeforePlayer = Math.floor(numberHorizontal / 2)
        numberAbovePlayer = Math.floor(numberVertical / 2)
        leftPosition = playerPosX - numberBeforePlayer;
        topPosition = playerPosY - numberAbovePlayer;
        firstDrawX = playerBlockX - (numberBeforePlayer * blockWidth)
        firstDrawY = playerBlockY - (numberAbovePlayer * blockWidth)
    } else if (playerPosY + numberAbovePlayer >= gameData.mineSize.height) {
        for(let i = 0; i < numberToAddToMine; i++) {
            let mineRow = [];
            for(let q = 0; q < gameData.mineSize.width; q++) {
                mineRow.push({blockType: getRandomBlock(i + gameData.mineSize.height), isMined: false});
            }
            gameData.mine.push(mineRow);
        }
        gameData.mineSize.height += numberToAddToMine;
    }
    //=========================================

    // draw actual mine
    for(let i = 0; i < numberVertical; i++) {
        for(let q = 0; q < numberHorizontal; q++) {
            if(i + topPosition > -1) {
                let blockData = window.gameData.blockTypeMap[window.gameData.mine[i + topPosition][q + leftPosition].blockType];
                let drawX;
                let drawY;
                let color;
                let width;

                if(!window.gameData.mine[i + topPosition][q + leftPosition].isVisible) {
                    drawX = firstDrawX + q*blockWidth;
                    drawY = firstDrawY + i*blockWidth;
                    color = '#000000';
                    width = blockWidth;

                } else {
                    drawX = firstDrawX + q*blockWidth + 1;
                    drawY = firstDrawY + i*blockWidth + 1;
                    color = blockData.color;
                    width = blockWidth - 2;
                }
                // only show blocks if they are close enough to something you've mined.

                if(!window.gameData.mine[i + topPosition][q + leftPosition].isMined) {
                    drawSquare({x: drawX, y: drawY, width: width, height: width, color: color, isGradient: blockData.isGradient, gradient:blockData.gradient});
                }
            }
        }
    }
}

function youDied(reason) {
    showMessage(reason);

    setTimeout(function() {
        init(true);
    }, 1000)
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
            }

        } else {
            // they're moving underground
            let nextBlock = gameData.blockTypeMap[gameData.mine[nextBlockY][nextBlockX].blockType];

            if(gameData.playerData.gas >= nextBlock.gasUsed) {
                let timeToGetThroughBlock =  nextBlock.hardness / gameData.playerData.speed;
                if(timeToGetThroughBlock < gameData.fastestYouCanMove) {
                    timeToGetThroughBlock = gameData.fastestYouCanMove;
                }
                // check if they've been moving long enough
                if(Date.now() - moveStartTime >= timeToGetThroughBlock) {
                    movePlayer(window.gameData.playerMoving.direction.x, window.gameData.playerMoving.direction.y);
                    window.gameData.playerMoving.started = Date.now();
                }
            } else {
                informationalMessage("You don't have enough gas to move there. Emergency Evacuations can save you from a sticky spot, and can be purchased, even when you're deep underground");
            }
        }
    }
}

function initMine() {
    let mineArray = [];

    for(let i = 0; i < window.gameData.mineSize.height; i++) {
        let mineRow = [];
        for(let q = 0; q < window.gameData.mineSize.width; q++) {

            mineRow.push({blockType: getRandomBlock(i), isMined: false, isVisible: i === 0});
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

    document.querySelector(".inventory-item.sellItems").addEventListener("click", function() {
        closeAllPopups();
        if(gameData.playerData.y < 0) {
            sellStore();
        } else {
            informationalMessage("You can not sell unless you are at the surface", 3000);
        }
    })

    document.querySelector(".inventory-item.buyItems").addEventListener("click", function() {
        showStore();
    })

    document.querySelector(".store .close").addEventListener("click", function() {
        document.querySelector(".store").style.display = "none";
    })

}

function initGameLoop(timestamp) {
    // do some stuff
    window.gameData.ctx.clearRect(0, 0, window.gameData.canvas.width, window.gameData.canvas.height);
    drawMine();
    calculatePlayerMove();
    drawPlayer();
    heatometer();
    gasometer();
    window.requestAnimationFrame(initGameLoop)
}

function init(fromButton = false) {
    // check screen size. If it's less than 400 square, don't allow it.
    resizeCanvas(document.getElementById("mainGameCanvas"));
    initListeners();
    if(fromButton || !localStorage.getItem("megaMiner")) {
        initGlobalVariables();
        localStorage.removeItem("megaMiner");
        initMine();
    }else {
        window.gameData = JSON.parse(localStorage.getItem("megaMiner"));
        window.gameData.canvas = document.getElementById("mainGameCanvas");
        window.gameData.ctx = document.getElementById("mainGameCanvas").getContext('2d');
    }


    updateDisplayedQty();
    handleRestartSave();
    cargoMeter();
    document.querySelector(".heatWarning").style.opacity = 0; // reset burn warning
    window.requestAnimationFrame(initGameLoop);
}
init()
