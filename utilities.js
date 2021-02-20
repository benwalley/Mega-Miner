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



    if (e.code === 'ArrowUp') {
        // up arrow
        window.gameData.playerMoving.direction = {x:0, y:-1}
        if(!window.gameData.playerMoving.started) {
            window.gameData.playerMoving.started = Date.now();
        }
        closeAllPopups();
    }
    else if (e.code === 'ArrowDown') {
        // down arrow
        window.gameData.playerMoving.direction = {x:0, y:1}
        if(!window.gameData.playerMoving.started) {
            window.gameData.playerMoving.started = Date.now();
        }
        closeAllPopups();
    }
    else if (e.code === 'ArrowLeft') {
        // left arrow
        window.gameData.playerMoving.direction = {x:-1, y:0}
        if(!window.gameData.playerMoving.started) {
            window.gameData.playerMoving.started = Date.now();
        }
        closeAllPopups();
    }
    else if (e.code === 'ArrowRight') {
        // right arrow
        window.gameData.playerMoving.direction = {x:1, y:0}
        if(!window.gameData.playerMoving.started) {
            window.gameData.playerMoving.started = Date.now();
        }
        closeAllPopups();
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
