// TODO: Add radar to see larger area


function cargoMeter() {
    let currentCargo = document.querySelector(".cargoMenu .current-number");
    let maxCargo = document.querySelector(".cargoMenu .max-can-carry");
    maxCargo.innerHTML = gameData.playerData.maxCargo;
    let currentCargoCount = 0;
    // get number in inventory that should count as cargo.
    for(let item in gameData.playerData.inventory) {
        if(item !== "empty" && item !== "dirt" && item !== "stone") {
            currentCargoCount += gameData.playerData.inventory[item];
        }
    }
    gameData.playerData.currentCargo = currentCargoCount;
    currentCargo.innerHTML = gameData.playerData.currentCargo;
}

function renderSellStoreItems() {
    let fullString = "";
    for(let item in gameData.playerData.inventory) {
        if(item !== "empty" && item !== "dirt" && item !== "stone" && gameData.playerData.inventory[item] > 0) {
            let qtyInInventory = gameData.playerData.inventory[item];
            let itemData = gameData.blockTypeMap[item];
            let html = '<div class="cargo-item" data-id = "' + item + '">\n' +
                '                <div class="cargo-item-icon" style="background:' + itemData.color +';"></div>\n' +
                '                <div class="cargo-item-name">' + item + '</div>\n' +
                '                <div class="cargo-item-price">$' + itemData.value + ' each</div>\n' +
                '                <div>QTY</div><input max = "' + qtyInInventory + '" min="0" class="numberToSell" type="number" value="0">\n' +
                '                <div class="sell-item customButton">Sell ($0)</div>\n' +
                '                <div class="sellAll customButton">Sell All ($' + qtyInInventory * itemData.value + ')</div>\n' +
                '            </div>'

            fullString += html;
        }
    }

    document.querySelector(".sell .sell-item-container").innerHTML = fullString;
    document.querySelector(".sell").style.display = "block";
    // click listener for the sell button
    document.querySelector(".sell .close").addEventListener("click", function() {
        document.querySelector(".sell").style.display = "none";
    })
}

function sellStore() {
    renderSellStoreItems();
    addSellStoreListeners();

}

function addSellStoreListeners() {
    let items = document.querySelectorAll(".sell .cargo-item .sell-item");
    for(let i = 0; i < items.length; i++) {
        // add listener for buy item
        items[i].addEventListener("click", function(e) {
            let type = e.target.parentElement.dataset.id;
            let qty = parseInt(e.target.parentElement.querySelector(".numberToSell").value);
            if(isNaN(qty)) {
                qty = 0;
            }
            let value = qty * gameData.blockTypeMap[type].value;
            gameData.playerData.money += value;
            gameData.playerData.inventory[type] -= qty;
            updateDisplayedQty();
            cargoMeter();
            sellStore();
        })
    }
    // add listener for change qty
    let qtyBoxes = document.querySelectorAll(".sell .cargo-item .numberToSell");
    for(let i = 0; i < qtyBoxes.length; i++) {

        qtyBoxes[i].addEventListener("change", function(e) {
            if(e.target.value > parseInt(e.target.max)) {
                e.target.value = parseInt(e.target.max);
            }
            let type = e.target.parentElement.dataset.id;
            e.target.parentElement.querySelector(".sell-item").innerHTML = "Sell ($" + parseInt(e.target.value) * gameData.blockTypeMap[type].value + ")";
        })
    }
    // add listener for buy all
    let itemTypes = document.querySelectorAll(".sell .cargo-item .sellAll");
    for(let i = 0; i < itemTypes.length; i++) {
        itemTypes[i].addEventListener("click", function(e) {
            let type = e.target.parentElement.dataset.id;
            let qty = gameData.playerData.inventory[type];
            let value = qty * gameData.blockTypeMap[type].value;
            gameData.playerData.money += value;
            gameData.playerData.inventory[type] -= qty;
            updateDisplayedQty();
            cargoMeter();
            sellStore();
        })
    }
}

function closeAllPopups() {
    document.querySelector(".sell").style.display = "none";
    document.querySelector(".store").style.display = "none";

}

function addStoreListeners() {
    let storeItems = document.querySelectorAll(".store .buy-item");

    for (let i = 0; i < storeItems.length; i++) {
        storeItems[i].querySelector(".buy-item-add").addEventListener("click", function(e) {
            let element = e.target.parentElement.dataset;
            let canBuy = true;
            if(element.item === "drillBit") {
                gameData.playerData.speed ? gameData.playerData.speed += parseInt(element.qty) : gameData.playerData.speed = parseInt(element.qty);
                gameData.playerData.money -= parseInt(element.price);
                canBuy = false;
            }
            if(element.item === "gas") {
                if(gameData.playerData.gas + parseInt(element.qty) > gameData.playerData.maxGas) {
                    canBuy = false;
                    informationalMessage("you can't buy that much gas. Upgrade your gas tank to carry more gas", 2000)
                }
            }
            if(element.item === "upgradeGasTank") {
                gameData.playerData.maxGas += parseInt(element.qty);
                gameData.playerData.gasUpgradeLevel ++;
                gameData.playerData.money -= parseInt(element.price);
                canBuy = false;
            }
            if(element.item === "upgradeCargoHold") {
                gameData.playerData.maxCargo += parseInt(element.qty);
                gameData.playerData.cargoHoldLevel ++;
                gameData.playerData.money -= parseInt(element.price);
                canBuy = false;
            }
            if(element.item === "heatResistance") {
                gameData.playerData.heatResistance += parseInt(element.qty);
                gameData.playerData.money -= parseInt(element.price);
                canBuy = false;
            }
            if(element.item === "emergencyEvacuation") {
                canBuy = false;
                gameData.playerData.y = gameData.startingPosition.y;
                gameData.playerData.x = gameData.startingPosition.x;
                gameData.playerData.money -= parseInt(element.price);
            }
            if(canBuy) {
                gameData.playerData[element.item] ? gameData.playerData[element.item] += parseInt(element.qty) : gameData.playerData[element.item] = parseInt(element.qty)
                gameData.playerData.money -= parseInt(element.price);
            }

            updateDisplayedQty();
            cargoMeter();
            showStore();
        })
    }
}

function showOrHideStoreItems() {
    let storeItems = document.querySelectorAll(".store .buy-item");
    let aboveGround = gameData.playerData.y < 0;
    for(let i = 0; i < storeItems.length; i++) {
        if(aboveGround && storeItems[i].dataset.price <= gameData.playerData.money) {
            // if you're above ground, un-disable them
            // if you aren't too high a level
            let maxLevel = parseInt(storeItems[i].dataset.maxLevel);
            if(maxLevel && maxLevel !== -1 && gameData.playerData[storeItems[i].dataset.item] >= maxLevel) {
                storeItems[i].classList.add("disabled");
            } else {
                storeItems[i].classList.remove("disabled");
            }
        } else if(storeItems[i].dataset.item === "emergencyEvacuation" && parseInt(storeItems[i].dataset.price) <= gameData.playerData.money) {
            storeItems[i].classList.remove("disabled");
        } else {
            // if you're underground, disable them unless you're emergency evacuation.
            if(storeItems[i].dataset.item !== "emergencyEvacuation" || parseInt(storeItems[i].dataset.price) > gameData.playerData.money) {
                storeItems[i].classList.add("disabled");
            }
        }
    }
}

function showStore() {
    closeAllPopups();

    let htmlString = "";
    // create Store HTML
    for(let i = 0; i < gameData.storeItems.length; i++) {
        let item = gameData.storeItems[i]
        let price = item.originalPrice;
        let level = gameData.playerData[item.inventoryName];
        let multiplier = item.upgradePriceMultiplier ?? gameData.priceMultiplier;
        let maxLevel =  item.maxLevel ?? -1;
        if(item.id !== "gas" && item.id !== "emergencyEvacuation") {
            // make price higher depending on level, if it isn't gas or an evacuation
            gameData.storeItems[i].price = Math.floor(price + ((level - 1) * (multiplier * price)));
        }

        let html = '<div class="buy-item ' + item.id + ' disabled" data-item="' + item.id + '" data-price="' + item.price + '" data-qty="' + item.qty + '" data-max-level="' + maxLevel +'">\n' +
            '            <div class="buy-item-label">' + item.name + '</div>\n' +
            '            <div class="buy-item-add">Buy</div>\n' +
            '            <div class="buy-item-price">$' + item.price + '</div>\n' +
            '        </div>'

        htmlString += html;
    }
    document.querySelector(".store .store-item-container").innerHTML = htmlString;

    document.querySelector(".store").style.display = "block";
    document.querySelector(".store .store-message").style.display = "none";
    if(gameData.playerData.y >= 0) {
        // if you're underground, inform them that they must be at the surface to purchase items.
        document.querySelector(".store .store-message").innerHTML = "you must be at the surface to purchase most items";
        document.querySelector(".store .store-message").style.display = "block";
    }

    showOrHideStoreItems();
    addStoreListeners();
}

/**
 * Update qty shown in cargo meter
 */
function updateDisplayedQty() {
    let inventoryString = "";
    let totalInventory = 0;
    for(let item in gameData.playerData.inventory) {
        // don't need to show how many coal you got.
        if(item !== "dirt" && item !== "stone" && item !== "empty" && gameData.playerData.inventory[item] > 0) {
            let elementHTML = '<div class="cargo-item"><span class="icon" style="background:' + gameData.blockTypeMap[item].color + '"></span><span class="inventory-title">' + item +'</span><span class="inventory-qty">' + gameData.playerData.inventory[item] +'</span></div>'
            inventoryString += elementHTML;
        }
    }
    document.querySelector(".cargo-item-container").innerHTML = inventoryString;

    document.querySelector(".inventory-item.money").innerHTML = "$" + gameData.playerData.money;
}

function gasometer() {
    let gasometer = document.querySelector(".gasometer");
    const numberGallons = gasometer.querySelector(".num-gallons .number");
    let percent  = Math.floor((gameData.playerData.gas/gameData.playerData.maxGas) * 100);
    gasometer.querySelector(".meter-cover").style.height = percent + "%";
    numberGallons.innerHTML = gameData.playerData.gas;
}

// deal with depth heat
function heatometer() {
    // calculate current heat
    let playerDepth = gameData.playerData.y > 0 ? gameData.playerData.y : 0;

    gameData.currentHeat = (playerDepth * gameData.heatMultiplier) / gameData.playerData.heatResistance;

    const heatometerArrow = document.querySelector(".heatometer .meter-fullness");
    const heatometerCover = document.querySelector(".heatometer .meter-cover");

    let percentageHeat = gameData.currentHeat/gameData.maxHeat;
    let showThreshold = 0.7;
    if(percentageHeat > showThreshold) {
        // show heat warning
        let warning = document.querySelector(".heatWarning");
        let shortSection = 1 - showThreshold
        let difference = percentageHeat - showThreshold; // amount that the percentage is in showThreshold.
        // get percentage of shortSection, that is difference.
        let perc = (difference/shortSection);
        warning.style.opacity = perc;
    }
    percentageHeat = Math.floor(percentageHeat * 100);
    if(percentageHeat >= gameData.maxHeat) {
        // you died
        informationalMessage("You burned to death!", 5000);
        init(true);
    }

    heatometerArrow.style.left = percentageHeat + "%";
    heatometerCover.style.width = percentageHeat + "%";
    document.querySelector(".heatometer .heatometerLevel").innerHTML = gameData.playerData.heatResistance;
}

function showMessage(message, className) {
    const messageDiv = document.querySelector(".message-div");
    messageDiv.querySelector(".content").innerHTML = message;
    if(className) {
        messageDiv.classList.add(className);
    }
    messageDiv.style.display = "block";
}

function informationalMessage(message, time) {
    let messageDiv = document.querySelector(".informationalMessage");
    messageDiv.innerHTML = message;
    messageDiv.style.display = "block"
    time = time ?? 5000;
    if(gameData.messageTimeout) {
        clearTimeout(gameData.messageTimeout);
    }
    gameData.messageTimeout = setTimeout(function() {
        let messageDiv = document.querySelector(".informationalMessage");
        messageDiv.style.display = "none"
    }, time)
}

function depthometer() {
    let depthDiv = document.querySelector(".depthometer .depth");
    depthDiv.innerHTML = gameData.playerData.y + 1;
}
