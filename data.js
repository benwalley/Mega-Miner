function initGlobalVariables() {
    window.gameData = {
        canvas: document.getElementById("mainGameCanvas"),
        ctx: document.getElementById("mainGameCanvas").getContext('2d'),
        mine: [],
        mineSize: {width: 100, height: 100},
        blockTypeMap: {
            empty: {probability: 0, color: '#eeeeee', hardness: 100, value: 0, first: 0, gasUsed: 1},
            dirt: {probability: 70, color: '#543400', hardness: 500, value: 0, first: 0, gasUsed: 1},
            stone: {probability: 1000, color: '#555555', hardness: 1000, value: 0, first: 1, gasUsed: 2},
            coal: {probability: 50, color: '#222222', hardness: 1500, value: 25, first: 5, gasUsed: 4},
            iron: {probability:20, color: '#8f9399', hardness: 2500, value: 50, first: 30, gasUsed: 7},
            silver: {probability: 10, color: '#e2e2e2', hardness: 3000, value: 100, first: 50, gasUsed: 10},
            gold: {probability: 8, color: '#ed8f1c', hardness: 3500, value: 200, first: 80, gasUsed: 12},
            sapphire: {probability: 5, color: '#1875ff', hardness: 4000, value: 300, first: 120, gasUsed: 15},
            emerald: {probability: 3, color: '#1d8600', hardness: 4500, value: 450, first: 200, gasUsed: 18},
            ruby: {probability: 2, color: '#a90e0e', hardness: 5000, value: 600, first: 300, gasUsed: 20},
            diamond: {probability: 1, color: '#6ddef3', hardness: 6000, value: 1000, first: 400, gasUsed: 25},
            bedrock: {probability: 2, color: '#000000', hardness: 999999999, value: 0, first: 10, gasUsed: 10000}
        },
        playerData: {inventory: {},gas: 0, money: 250, heatResistance: 1,  maxGas: 500, currentCargo: 0, maxCargo: 15, x: 50, y:-1, speed: 1, color: "#2988a0", playerDrawX: Math.floor(document.getElementById("mainGameCanvas").width/2), playerDrawY: Math.floor(document.getElementById("mainGameCanvas").height/2)},
        playerMoving: {started: 0, direction: undefined, currentMove: undefined},
        mineData: {blockWidth: 100},
        groundHeight: 300,
        viewportCenter: {x: 50, y: 2},
        heatMultiplier: 2,
        gradients: {gold:[[0, '#BF953F'], [.25, '#FCF6BA'], [.5, '#B38728'], [.75, '#FBF5B7'], [1, '#AA771C']]},
        maxHeat: 100,
        currentHeat: 5,
        fastestYouCanMove: 50,
        mapCargoName: {heatResistance: "Heat Resistance"},
        drillBitLevels: ["#730000", "#51dee3", "#8671ff", "#ff52aa", "#ff3f3f", "#F87710"],
        storeItems: [
            {name: "Gas (50gal)", id: "gas", price: 20, qty: 50},
            {name: "Heat Resistance", id: "heatResistance", price: 200, qty: 1},
            {name: "Upgrade Gas Tank (+200gal)", id: "upgradeGasTank", price: 200, qty: 200},
            {name: "Drill Bit Power", id: "drillBit", price: 200, qty: 1},
            {name: "Upgrade Cargo Hold (+10)", id: "upgradeCargoHold", price: 200, qty: 10},
            {name: "Emergency Evacuation", id: "emergencyEvacuation", price: 1000, qty: 1},
        ]
    };
}
