function init() {
    // check screen size. If it's less than 400 square, don't allow it.
    resizeCanvas(document.getElementById("mainGameCanvas"));
    initListeners();
    initGlobalVariables();
    window.requestAnimationFrame(initGameLoop);
    initMine();
    updateDisplayedQty();
    controlStoreVisibility();
    addStoreListeners();
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
        playerData: {inventory: {gas: 5000, money: 100}, x: 50, y:-1, speed: 10, color: "#2988a0", playerDrawX: Math.floor(document.getElementById("mainGameCanvas").width/2), playerDrawY: Math.floor(document.getElementById("mainGameCanvas").height/2)},
        playerMoving: {started: 0, direction: undefined, currentMove: undefined},
        mineData: {blockWidth: 100},
        groundHeight: 300,
        viewportCenter: {x: 50, y: 2}
    };
    // TODO: save game data to the local storage;
}

function addStoreListeners() {
    let storeItems = document.querySelectorAll(".store .buy-item");
    for (let i = 0; i < storeItems.length; i++) {
        storeItems[i].querySelector(".buy-item-add").addEventListener("click", function(e) {
            let element = e.target.parentElement.dataset;
            gameData.playerData.inventory[element.item] ? gameData.playerData.inventory[element.item] += parseInt(element.qty) : gameData.playerData.inventory[element.item] = parseInt(element.qty)
            gameData.playerData.inventory.money -= parseInt(element.price);
            updateDisplayedQty();
            controlStoreVisibility();
        })
    }
}

function controlStoreVisibility() {
    const isPlayerAboveGround = gameData.playerData.y === -1;
    const playersMoney = gameData.playerData.inventory.money;
    let storeItems = document.querySelectorAll(".store .buy-item");

    if (isPlayerAboveGround) {
        // check whether they have enough money to buy stuff;
        for (let i = 0; i < storeItems.length; i++) {
            let item = storeItems[i].dataset.item;
            let price = storeItems[i].dataset.price;
            if (playersMoney < price) {
                storeItems[i].classList.add("disabled");
            } else if (playersMoney >= price) {
                storeItems[i].classList.remove("disabled");
            }
        }
    }
}

function getRandomBlock() {
    let blockTypeArray = [];
    let averageFrom = 0;
    // get array of block types
    for(const block in window.gameData.blockTypeMap) {
        blockTypeArray.push(block);
        averageFrom += gameData.blockTypeMap[block].probability;
    }

    let randValue = Math.floor(Math.random() * averageFrom);
    let counter = 0;
    let blockType = 'stone';
    for(let j = 0; j < blockTypeArray.length; j++) {
        counter += gameData.blockTypeMap[blockTypeArray[j]].probability;
        if (randValue < counter) {
            return blockTypeArray[j];
        }
    }

    return blockType;
}

function initMine() {
    let mineArray = [];

    for(let i = 0; i < window.gameData.mineSize.width; i++) {
        let mineRow = [];
        for(let q = 0; q < window.gameData.mineSize.height; q++) {

            mineRow.push({blockType: getRandomBlock(), isMined: false});
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
        // if they have items, cash them in
        let inventory = gameData.playerData.inventory;
        for(const item in inventory) {
            // check if it exists in the mapping table
            if(gameData.blockTypeMap[item] !== undefined) {
                // cash it in;
                gameData.playerData.inventory.money += gameData.blockTypeMap[item].value * inventory[item];
                gameData.playerData.inventory[item] = 0;
                updateDisplayedQty();
                controlStoreVisibility();
            }
        }
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
    const moneyDisplay = document.querySelector(".navbar .money .inventory-qty");

    gasDisplay.innerHTML = gameData.playerData.inventory.gas ?? 0;
    dirtDisplay.innerHTML = gameData.playerData.inventory.dirt ?? 0;
    stoneDisplay.innerHTML = gameData.playerData.inventory.stone ?? 0;
    coalDisplay.innerHTML = gameData.playerData.inventory.coal ?? 0;
    ironDisplay.innerHTML = gameData.playerData.inventory.iron ?? 0;
    diamondDisplay.innerHTML = gameData.playerData.inventory.diamond ?? 0;
    moneyDisplay.innerHTML = gameData.playerData.inventory.money ?? 0;
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
            if(Date.now() - moveStartTime >= nextBlock.hardness / gameData.playerData.speed) {
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
    if(playerPosX + numberBeforePlayer > gameData.mineSize.width) {
        // add to end of mine
        for (var i = 0; i < gameData.mineSize.height; i++) {
            for (var q = 0; q < numberToAddToMine; q++) {
                gameData.mine[i].push({blockType: getRandomBlock(), isMined: false});
            }
        }
        gameData.mineSize.width += numberToAddToMine;
    } else if (leftPosition < 0) {
        // add to beginning of mine
        for (var i = 0; i < gameData.mineSize.height; i++) {
            for (var q = 0; q < numberToAddToMine; q++) {
                gameData.mine[i].unshift({blockType: getRandomBlock(), isMined: false});
            }
        }
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
                mineRow.push({blockType: getRandomBlock(), isMined: false});
            }
            gameData.mine.push(mineRow);
        }
        gameData.mineSize.height += numberToAddToMine;
    }

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
