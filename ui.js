// TODO: handle store when restarted
// TODO: change icon colors to match mat colors
// TODO: upgrading drill bit, changes your color
// TODO: make sell buttons work.


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

function sellStore() {
    let fullString = "";
    for(let item in gameData.playerData.inventory) {
        if(item !== "empty" && item !== "dirt" && item !== "stone") {
            let qtyInInventory = gameData.playerData.inventory[item];
            let itemData = gameData.blockTypeMap[item];
            let html = '<div class="cargo-item">\n' +
                '                <div class="cargo-item-icon" style="background: "' + itemData.color +'"></div>\n' +
                '                <div class="cargo-item-name">' + item + '</div>\n' +
                '                <div class="cargo-item-price">$' + itemData.value + ' each</div>\n' +
                '                <div>QTY</div><input max = "' + qtyInInventory + '" class="numberToSell" type="number">\n' +
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
                gameData.playerData.money -= parseInt(element.price);
                canBuy = false;
            }
            if(element.item === "upgradeCargoHold") {
                gameData.playerData.maxCargo += parseInt(element.qty);
                gameData.playerData.money -= parseInt(element.price);
                canBuy = false;
            }
            if(element.item === "heatResistance") {
                gameData.playerData.heatResistance += parseInt(element.qty);
                gameData.playerData.money -= parseInt(element.price);
                canBuy = false;
            }

            if(element.item === "heatResistance") {
                gameData.playerData.heatResistance += parseInt(element.qty);
                gameData.playerData.money -= parseInt(element.price);
                canBuy = false;
            }
            if(element.item === "emergency-evacuation") {
                canBuy = false;
                gameData.playerData.y = -1;
                gameData.playerData.x = 50;
                gameData.playerData.money -= parseInt(element.price);
            }
            if(canBuy) {
                gameData.playerData[element.item] ? gameData.playerData[element.item] += parseInt(element.qty) : gameData.playerData[element.item] = parseInt(element.qty)
                gameData.playerData.money -= parseInt(element.price);
            }

            updateDisplayedQty();
            cargoMeter();
            showOrHideStoreItems();
        })
    }
}

function showOrHideStoreItems() {
    let storeItems = document.querySelectorAll(".store .buy-item");
    let aboveGround = gameData.playerData.y < 0;
    for(let i = 0; i < storeItems.length; i++) {
        if(aboveGround && storeItems[i].dataset.price <= gameData.playerData.money) {
            // if you're above ground, un-disable them
            storeItems[i].classList.remove("disabled");
        } else {
            // if you're underground, disable them unless you're emergency evacuation.
            if(storeItems[i].dataset.item !== "emergency-evacuation" || storeItems[i].dataset.price > gameData.playerData.money) {
                storeItems[i].classList.add("disabled");
            }
        }
    }
}

function showStore() {
    closeAllPopups();
    document.querySelector(".store").style.display = "block";
    document.querySelector(".store .store-message").style.display = "none";
    if(gameData.playerData.y >= 0) {
        // if you're underground, inform them that they must be at the surface to purchase items.
        document.querySelector(".store .store-message").innerHTML = "you must be at the surface to purchase most items";
        document.querySelector(".store .store-message").style.display = "block";
    }

    showOrHideStoreItems();
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
            let elementHTML = '<div class="cargo-item"><span class="icon"></span><span class="inventory-title">' + item +'</span><span class="inventory-qty">' + gameData.playerData.inventory[item] +'</span></div>'
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
    percentageHeat = Math.floor(percentageHeat * 100);
    if(percentageHeat >= gameData.maxHeat) {
        // you died
        // youDied("You burned to death")
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
    setTimeout(function() {
        let messageDiv = document.querySelector(".informationalMessage");
        messageDiv.style.display = "none"
    }, time)
}
