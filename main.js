// TODO
// make max you can cary
// make max speed you can go, so it doesn't get too hard to control yourself

// UTILITY CLASSES
function getGradient(type) {
    const gradientArray = gameData.gradients[type];
    let gradient = gameData.ctx.createLinearGradient(0, 0, gameData.mineData.blockWidth, 0);
    for(var i = 0; i < gradientArray.length; i++) {
        gradient.addColorStop(gradientArray[i][0], gradientArray[i][1]);
    }
    return gradient;
}

function getRandomBlock(y) {
    let blockTypeArray = [];
    let averageFrom = 0;
    // get array of block types
    for(const block in window.gameData.blockTypeMap) {
        if(gameData.blockTypeMap[block].first <= y) {
            blockTypeArray.push(block);
            averageFrom += gameData.blockTypeMap[block].probability;
        }
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

function checkKeyDown(e) {
    e = e || window.event;
    if(!window.gameData.playerMoving.started) {
        window.gameData.playerMoving.started = Date.now();
    }


    if (e.code === 'ArrowUp') {
        // up arrow
        window.gameData.playerMoving.direction = {x:0, y:-1}
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

function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawSquare(data) {
    if(data.isGradient) {
        gameData.ctx.fillStyle = getGradient('gold');
    }else if(data.color) {
        gameData.ctx.fillStyle = data.color;
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
        gameData.ctx.strokeStyle = "#52b325";
        gameData.ctx.stroke();
    }
}


function addStoreListeners() {
    // clone it to get rid of listeners
    let store = document.querySelector(".store");
    let clone = store.cloneNode(true);
    store.parentNode.replaceChild(clone, store);
    // redefine it after clone
    let storeItems = document.querySelectorAll(".store .buy-item");

    for (let i = 0; i < storeItems.length; i++) {

        storeItems[i].querySelector(".buy-item-add").addEventListener("click", function(e) {
            let element = e.target.parentElement.dataset;
            let canBuy = true;
            if(element.item === "drillBit") {
                gameData.playerData.speed ? gameData.playerData.speed += parseInt(element.qty) : gameData.playerData.speed = parseInt(element.qty)
            }
            if(element.item === "gas") {
                if(gameData.playerData.inventory.gas + parseInt(element.qty) > gameData.playerData.maxGas) {
                    canBuy = false;
                    alert("you can't buy that much gas. Upgrade your gas tank to carry more gas")
                }
            }
            if(element.item === "upgradeGasTank") {
                gameData.playerData.maxGas += parseInt(element.qty);
                gameData.playerData.inventory.money -= parseInt(element.price);
                canBuy = false;
            }
            if(element.item === "emergency-evacuation") {
                canBuy = false;
                gameData.playerData.y = -1;
                gameData.playerData.x = 50;
                gameData.playerData.inventory.money -= parseInt(element.price);
            }
            if(canBuy) {
                gameData.playerData.inventory[element.item] ? gameData.playerData.inventory[element.item] += parseInt(element.qty) : gameData.playerData.inventory[element.item] = parseInt(element.qty)
                gameData.playerData.inventory.money -= parseInt(element.price);
            }

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
    } else {
        for (let i = 0; i < storeItems.length; i++) {
            // emergency evacuation is available anytime.
            let price = storeItems[i].dataset.price;
            if(storeItems[i].dataset.item !== "emergency-evacuation" || playersMoney < price) {
                storeItems[i].classList.add("disabled")
            }
        }
    }
}

function updateDisplayedQty() {
    const typeArray = ['coal', 'iron', 'silver', 'gold', 'emerald', 'sapphire', 'ruby', 'diamond', 'money'];

    for(var i = 0; i < typeArray.length; i++) {
        const display = document.querySelector(".navbar ." + typeArray[i]  + " .inventory-qty");
        display.innerHTML = gameData.playerData.inventory[typeArray[i]] ?? 0;
    }
    const drillBitPower = document.querySelector(".navbar .drill-bit .inventory-qty");
    drillBitPower.innerHTML = gameData.playerData.speed ?? 0;
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
        const gasAfterMove = gameData.playerData.inventory.gas - gameData.blockTypeMap[blockType].gasUsed;
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
        }
        controlStoreVisibility();
    }

    makeBlocksVisibleAround(potentialPosition.x, potentialPosition.y);
}

function makeBlocksVisibleAround(x, y) {
    // Make blocks Visible around you.
    if(y < 0) {
        gameData.mine[y + 1][x - 1].isVisible = true;
        gameData.mine[y + 1][x].isVisible = true;
        gameData.mine[y + 1][x + 1].isVisible = true;
    } else if (y === 0) {
        gameData.mine[y][x].isVisible = true;
        gameData.mine[y][x - 1].isVisible = true;
        gameData.mine[y][x + 1].isVisible = true;
        gameData.mine[y + 1][x - 1].isVisible = true;
        gameData.mine[y + 1][x].isVisible = true;
        gameData.mine[y + 1][x + 1].isVisible = true;
    } else {
        gameData.mine[y][x].isVisible = true;
        gameData.mine[y - 1][x - 1].isVisible = true;
        gameData.mine[y - 1][x].isVisible = true;
        gameData.mine[y - 1][x + 1].isVisible = true;
        gameData.mine[y][x - 1].isVisible = true;
        gameData.mine[y][x + 1].isVisible = true;
        gameData.mine[y + 1][x - 1].isVisible = true;
        gameData.mine[y + 1][x].isVisible = true;
        gameData.mine[y + 1][x + 1].isVisible = true;
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
    if(playerPosX + numberBeforePlayer > gameData.mineSize.width) {
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

function gasometer() {
    let gasometer = document.querySelector(".gasometer");
    const numberGallons = gasometer.querySelector(".num-gallons .number");
    let percent  = Math.floor((gameData.playerData.inventory.gas/gameData.playerData.maxGas) * 100);
    gasometer.querySelector(".meter-cover").style.height = percent + "%";
    numberGallons.innerHTML = gameData.playerData.inventory.gas;
}

// deal with depth heat
function heatometer() {
    // calculate current heat
    let playerDepth = gameData.playerData.y > 0 ? gameData.playerData.y : 0;

    gameData.currentHeat = (playerDepth * gameData.heatMultiplier) / gameData.playerData.inventory.heatResistance;

    const heatometerArrow = document.querySelector(".heatometer .meter-fullness");
    const heatometerCover = document.querySelector(".heatometer .meter-cover");

    let percentageHeat = gameData.currentHeat/gameData.maxHeat;
    percentageHeat = Math.floor(percentageHeat * 100);
    if(percentageHeat >= gameData.maxHeat) {
        // you died
        // youDied("You burned to death")
    }
    heatometerArrow.style.left = percentageHeat + "%";
    heatometerCover.style.width = percentageHeat + "%";
}

function youDied(reason) {
    showMessage(reason);

    setTimeout(function() {
        init(true);
    }, 1000)
}

function showMessage(message, className) {
    const messageDiv = document.querySelector(".message-div");
    messageDiv.querySelector(".content").innerHTML = message;
    if(className) {
        messageDiv.classList.add(className);
    }
    messageDiv.style.display = "block";
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

            if(gameData.playerData.inventory.gas >= nextBlock.gasUsed) {
                // check if they've been moving long enough
                if(Date.now() - moveStartTime >= nextBlock.hardness / gameData.playerData.speed) {
                    movePlayer(window.gameData.playerMoving.direction.x, window.gameData.playerMoving.direction.y);
                    window.gameData.playerMoving.started = Date.now();
                }
            } else {
                const evacuationPrice = document.querySelector(".emergency-evacuation").dataset.price;
                if(gameData.playerData.inventory.money >= evacuationPrice) {
                    // showMessage("You ran out of gas. Your only hope of survival, is to call for an emergency evacuation.");
                }
                // show message
                // showMessage("You don't have enough gas to move there. Move somewhere else, or die trying");
            }
        }
    }
}


function initGlobalVariables() {
    window.gameData = {
        canvas: document.getElementById("mainGameCanvas"),
        ctx: document.getElementById("mainGameCanvas").getContext('2d'),
        mine: [],
        mineSize: {width: 100, height: 100},
        blockTypeMap: {
            empty: {probability: 0, color: '#eeeeee', hardness: 100, value: 0, first: 0, gasUsed: 1},
            dirt: {probability: 10, color: '#543400', hardness: 500, value: 0, first: 0, gasUsed: 2},
            stone: {probability: 50, color: '#555555', hardness: 1000, value: 0, first: 1, gasUsed: 5},
            coal: {probability: 20, color: '#222222', hardness: 1500, value: 15, first: 5, gasUsed: 7},
            iron: {probability: 10, color: '#8f9399', hardness: 2500, value: 25, first: 30, gasUsed: 15},
            silver: {probability: 10, color: '#e2e2e2', hardness: 3000, value: 40, first: 50, gasUsed: 20},
            gold: {probability: 5, color: '#ed8f1c', hardness: 3500, value: 60, first: 80, gasUsed: 25},
            sapphire: {probability: 10, color: '#1875ff', hardness: 4000, value: 100, first: 120, gasUsed: 30},
            emerald: {probability: 10, color: '#1d8600', hardness: 45000, value: 200, first: 200, gasUsed: 35},
            ruby: {probability: 5, color: '#a90e0e', hardness: 5000, value: 300, first: 300, gasUsed: 45},
            diamond: {probability: 1, color: '#6ddef3', hardness: 6000, value: 500, first: 400, gasUsed: 50},
            bedrock: {probability: 2, color: '#000000', hardness: 999999999, value: 0, first: 10, gasUsed: 10000}
        },
        playerData: {inventory: {gas: 0, money: 250, heatResistance: 1}, maxGas: 500, x: 50, y:-1, speed: 1, color: "#2988a0", playerDrawX: Math.floor(document.getElementById("mainGameCanvas").width/2), playerDrawY: Math.floor(document.getElementById("mainGameCanvas").height/2)},
        playerMoving: {started: 0, direction: undefined, currentMove: undefined},
        mineData: {blockWidth: 100},
        groundHeight: 300,
        viewportCenter: {x: 50, y: 2},
        heatMultiplier: .8,
        gradients: {gold:[[0, '#BF953F'], [.25, '#FCF6BA'], [.5, '#B38728'], [.75, '#FBF5B7'], [1, '#AA771C']]},
        maxHeat: 100,
        currentHeat: 5
    };
    // TODO: save game data to the local storage;
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
    controlStoreVisibility();
    addStoreListeners();
    handleRestartSave();
    window.requestAnimationFrame(initGameLoop);
}
init()
