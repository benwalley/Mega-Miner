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
        playerData: {inventory: {},gas: 0, money: 250, heatResistance: 1,  maxGas: 500, currentCargo: 0, maxCargo: 25, x: 50, y:-1, speed: 1, color: "#2988a0", playerDrawX: Math.floor(document.getElementById("mainGameCanvas").width/2), playerDrawY: Math.floor(document.getElementById("mainGameCanvas").height/2)},
        playerMoving: {started: 0, direction: undefined, currentMove: undefined},
        mineData: {blockWidth: 100},
        groundHeight: 300,
        viewportCenter: {x: 50, y: 2},
        heatMultiplier: 1,
        gradients: {gold:[[0, '#BF953F'], [.25, '#FCF6BA'], [.5, '#B38728'], [.75, '#FBF5B7'], [1, '#AA771C']]},
        maxHeat: 100,
        currentHeat: 5,
        fastestYouCanMove: 50,
        mapCargoName: {heatResistance: "Heat Resistance"},
        drillBitLevels: ["#730000", "#51dee3", "#8671ff", "#ff52aa", "#ff3f3f", "#F87710"]
    };
}
