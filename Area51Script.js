// ===================================================================
// Start - Global Variables
// ===================================================================
var AM = new AssetManager();
var canvas = document.getElementById('gameWorld');
var ctx = canvas.getContext('2d');

var gameEngine = new GameEngine();
gameEngine.init(ctx);
gameEngine.start();
var players = [];
var dim = 18; //Cell size
var spriteDim = 18;

var prevCameraOrigin = { x: 0, y: 0 };
var cameraOrigin = { x: 0, y: 0 }; //Camera in top left pixel of screen

var gameBoard = BuildBoard();
console.log("%c gameBoard below this:", "background: #222; color: #bada55");
console.log(gameBoard);

var regionsList = [];
BuildRegions();
console.log("%c regionsList below this:", "background: #222; color: #bada55");
console.log(regionsList);

for (var i = 0; i < regionsList.length; i++) {
    if (regionsList[i] != undefined)
        console.log(regionsList[i].barracksXY[0]);
}

var onScreenRegions = []; // This is the overlay used for the click event
createArray(cameraOrigin);
console.log("%c onScreenRegions below this:", "background: #222; color: #bada55");
console.log(onScreenRegions);

var bgWidth = 2340;
var bgHeight = 2340;

var modbgWidth = bgWidth;
var modbgHeight = bgHeight;

var debug = true;
var debugGrid = false;

var selectedRegion = -1;
var currentPlayerTurn = 0;
// ===================================================================
// End - Global Variables
// ===================================================================



// ===================================================================
// Start - Animation
// ===================================================================
function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
        xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
        this.frameWidth, this.frameHeight,
        x, y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}
// ===================================================================
// End - Animation
// ===================================================================



// ===================================================================
// Start - Map Entities
// ===================================================================
/**
 * Creates a troop in the game.
 * 
 * @param {String} name name of the troop (name must be unique)
 * @param {int} atk attack value of the troop
 * @param {int} def defense value of the troop
 * @param {int} cost cost value of the troop
 * @param {int} move defines how far the troop can move
 */
function Troop(name, atk, def, cost, move) {
    this.name = name,
        this.atk = atk,
        this.def = def,
        this.cost = cost,
        this.move = move
}

/**
 * Creates a building in the game.
 * 
 * @param {String} name name of the building (name must be unique)
 * @param {int} cost cost value of the building
 */
function Building(name, cost) {
    this.name = name,
        this.cost = cost
}

/**
 * 
 * @param {*} id Region identification number
 * @param {*} owner 1 for Player 2 owned. 0 for Player 1 owned.
 * @param {*} bldgXY [x,y] animation location
 * @param {*} troopXY [x,y] animation location
 * @param {*} cap true/false
 * @param {*} capXY [x,y] animation location
 * @param {*} territory Territory for the region
 * @param {*} neighbors array of neighbor IDs
 */
function Region(id, owner, barracksXY, farmXY, troopXY, cap, capXY, territory, neighbors) {
    this.id = id,
        this.owner = owner,
        this.bldg = [],
        this.barracksXY = barracksXY,
        this.farmXY = farmXY,
        this.troop = [],
        this.troopXY = troopXY,
        this.captain = cap,
        this.capXY = capXY,
        this.territory = territory,
        this.neighbors = neighbors
}

function Player() {
    this.moneyCount = 0,
        this.ownedRegions = []

}
// ===================================================================
// End - Map Entities
// ===================================================================



// ===================================================================
// Start - Utility Functions
// ===================================================================\

function addCaptainToRegion(region) {
    if(curr)
    var newCap = new 
    region.cap = true;

}

function addCaptainToRegion(region) {
    region.cap = true;
}

/**
 * Creates array of region IDs on screen
 * @param {*} origin 
 */
function changeCameraOrigin(x, y) {
    prevCameraOrigin.x = cameraOrigin.x;
    prevCameraOrigin.y = cameraOrigin.y;
    cameraOrigin.x = x;
    cameraOrigin.y = y;
}

/**
 * Creates array of region IDs on screen
 * @param {*} origin 
 */
function createArray(origin) {
    for (var i = 0; i < gameEngine.surfaceWidth / dim; i++) {
        onScreenRegions[i] = new Array((gameEngine.surfaceHeight / dim).toFixed(0));
        console.log("hello" + (gameEngine.surfaceHeight / dim).toFixed(0))
    }

    // update the value of the array
    for (var i = 0; i < gameEngine.surfaceWidth / dim; i++) {
        for (var j = 0; j < gameEngine.surfaceHeight / dim; j++) {
            let xCor = origin.x + i;
            let yCor = origin.y + j;

            if (gameBoard[xCor][yCor] != null) {
                onScreenRegions[i][j] = {
                    name: gameBoard[yCor][xCor],
                    x: i * dim,
                    y: j * dim,
                    w: dim,
                    h: dim
                };
            } else {
                onScreenRegions[i][j] = null;
            }

        }
    }
}
/**
 * Creates rectangles and returns selected box
 * @param {*} rects array of hit boxes
 * @param {*} x x position of mouse click
 * @param {*} y y position of mouse click
 */
function getClickedRegion(rects, x, y) {
    var regionId = null;
    for (var i = 0, len = rects.length; i < len; i++) {
        for (var j = 0, len2 = rects[i].length; j < len2; j++) {

            var left = rects[i][j].x;
            var right = rects[i][j].x + rects[i][j].w;
            var top = rects[i][j].y;
            var bottom = rects[i][j].y + rects[i][j].h;

            if (right >= x
                && left <= x
                && bottom >= y
                && top <= y) {
                regionId = rects[i][j];
            }

        }
    }
    return regionId;
}

function getClickedItem(items, x, y) {
    var output = null;
    for (var i = 0, len = items.length; i < len; i++) {

        var left = items[i].x;
        var right = items[i].x + items[i].w;
        var top = items[i].y;
        var bottom = items[i].y + items[i].h;

        if (right >= x
            && left <= x
            && bottom >= y
            && top <= y) {
            output = items[i];
        }


    }
    return output;
}



function BuildRegions() {
    regionsList[10] = new Region(10, 0, [520 + (spriteDim * 50), 265 + (spriteDim * 29)], [410 + (spriteDim * 50), 445 + (spriteDim * 29)], [525 + (spriteDim * 50), 380 + (spriteDim * 29)], false, [0, 0], 'plains', [])
    regionsList[11] = new Region(11, 0, [300 + (spriteDim * 59), 455 + (spriteDim * 46)], [455 + (spriteDim * 59), 560 + (spriteDim * 46)], [605 + (spriteDim * 59), 515 + (spriteDim * 46)], false, [0, 0], 'plains', [])
    regionsList[12] = new Region(12, 0, [540 + (spriteDim * 22), 200 + (spriteDim * 54)], [530 + (spriteDim * 22), 450 + (spriteDim * 54)], [605 + (spriteDim * 22), 290 + (spriteDim * 54)], false, [0, 0], 'plains', [])
    regionsList[13] = new Region(13, 0, [275 + (spriteDim * 19), 330 + (spriteDim * 61)], [275 + (spriteDim * 19), 415 + (spriteDim * 61)], [305 + (spriteDim * 19), 290 + (spriteDim * 61)], false, [0, 0], 'plains', [])
    regionsList[14] = new Region(14, 0, [300 + (spriteDim * 0), 200 + (spriteDim * 68)], [230 + (spriteDim * 0), 450 + (spriteDim * 54)], [220 + (spriteDim * 0), 295 + (spriteDim * 55)], false, [0, 0], 'plains', [])
    regionsList[15] = new Region(15, 0, [150, 260], [250, 185], [460, 270], false, [0, 0], 'plains', [])
    regionsList[16] = new Region(16, 0, [470, 345], [445, 425], [345, 450], false, [0, 0], 'plains', [])
    regionsList[17] = new Region(17, 0, [610, 205], [610, 355], [680, 440], false, [0, 0], 'plains', [])
    regionsList[18] = new Region(18, 0, [310 + (spriteDim * 20), 265 + (spriteDim * 22)], [480 + (spriteDim * 20), 265 + (spriteDim * 22)], [445 + (spriteDim * 20), 335 + (spriteDim * 22)], false, [0, 0], 'plains', [])
    regionsList[19] = new Region(19, 0, [285, 665], [245, 750], [235, 690], false, [0, 0], 'plains', [])
    regionsList[40] = new Region(40, 0, [680 + (spriteDim * 101), 140 + (spriteDim * 61)], [570 + (spriteDim * 101), 480 + (spriteDim * 61)], [525 + (spriteDim * 101), 410 + (spriteDim * 61)], false, [0, 0], 'tundra', [])
    regionsList[41] = new Region(41, 0, [880 + (spriteDim * 101), 285 + (spriteDim * 55)], [1010 + (spriteDim * 101), 475 + (spriteDim * 55)], [1055 + (spriteDim * 101), 163 + (spriteDim * 55)], false, [0, 0], 'tundra', [])
    regionsList[42] = new Region(42, 0, [975 + (spriteDim * 101), 240 + (spriteDim * 38)], [1085 + (spriteDim * 101), 250 + (spriteDim * 38)], [940 + (spriteDim * 101), 245 + (spriteDim * 38)], false, [0, 0], 'tundra', [])
    regionsList[43] = new Region(43, 0, [735 + (spriteDim * 101), 100 + (spriteDim * 0)], [750 + (spriteDim * 101), 310 + (spriteDim * 0)], [800 + (spriteDim * 101), 220 + (spriteDim * 0)], false, [0, 0], 'tundra', [])
    regionsList[44] = new Region(44, 0, [590 + (spriteDim * 101), 410 + (spriteDim * 21)], [665 + (spriteDim * 101), 335 + (spriteDim * 21)], [580 + (spriteDim * 101), 300 + (spriteDim * 21)], false, [0, 0], 'tundra', [])
    regionsList[45] = new Region(45, 0, [635 + (spriteDim * 37), 60 + (spriteDim * 3)], [660 + (spriteDim * 37), 140 + (spriteDim * 3)], [555 + (spriteDim * 37), 140 + (spriteDim * 3)], false, [0, 0], 'tundra', [])
    regionsList[46] = new Region(46, 0, [390 + (spriteDim * 61), 465 + (spriteDim * 0)], [210 + (spriteDim * 61), 440 + (spriteDim * 0)], [350 + (spriteDim * 61), 360 + (spriteDim * 0)], false, [0, 0], 'tundra', [])
    regionsList[47] = new Region(47, 0, [640 + (spriteDim * 61), 410 + (spriteDim * 0)], [575 + (spriteDim * 61), 115 + (spriteDim * 0)], [590 + (spriteDim * 61), 280 + (spriteDim * 0)], false, [0, 0], 'tundra', [])
    regionsList[48] = new Region(48, 0, [310 + (spriteDim * 101), 320 + (spriteDim * 0)], [310 + (spriteDim * 101), 580 + (spriteDim * 0)], [460 + (spriteDim * 101), 315 + (spriteDim * 0)], false, [0, 0], 'tundra', [])
    regionsList[49] = new Region(49, 0, [965 + (spriteDim * 101), 420 + (spriteDim * 0)], [965 + (spriteDim * 101), 300 + (spriteDim * 0)], [1100 + (spriteDim * 101), 230 + (spriteDim * 0)], false, [0, 0], 'tundra', [])
    regionsList[50] = new Region(50, 0, [450 + (spriteDim * 101), 380 + (spriteDim * 42)], [335 + (spriteDim * 101), 275 + (spriteDim * 42)], [530 + (spriteDim * 101), 310 + (spriteDim * 42)], false, [0, 0], 'tundra', [])
    regionsList[29] = new Region(29, 1, [760 + (dim * 0), 310 + (dim * 148)], [770 + (dim * 0), 500 + (dim * 148)], [925 + (dim * 0), 430 + (dim * 148)], false, [0, 0], 'sand', [])
    regionsList[30] = new Region(30, 1, [590 + (dim * 0), 385 + (dim * 148)], [590 + (dim * 0), 495 + (dim * 148)], [510 + (dim * 0), 465 + (dim * 148)], false, [0, 0], 'sand', [])
    regionsList[31] = new Region(31, 1, [170 + (dim * 0), 385 + (dim * 148)], [315 + (dim * 0), 390 + (dim * 148)], [275 + (dim * 0), 555 + (dim * 148)], false, [0, 0], 'sand', [])
    regionsList[32] = new Region(32, 1, [295 + (dim * 0), 495 + (dim * 123)], [430 + (dim * 0), 565 + (dim * 123)], [595 + (dim * 0), 490 + (dim * 123)], false, [0, 0], 'sand', [])
    regionsList[33] = new Region(33, 1, [140 + (dim * 0), 360 + (dim * 123)], [135 + (dim * 0), 480 + (dim * 123)], [190 + (dim * 0), 220 + (dim * 123)], false, [0, 0], 'sand', [])
    regionsList[34] = new Region(34, 1, [570 + (dim * 41), 75 + (dim * 113)], [500 + (dim * 41), 270 + (dim * 113)], [675 + (dim * 41), 175 + (dim * 113)], false, [0, 0], 'sand', [])
    regionsList[35] = new Region(35, 1, [295 + (dim * 1), 280 + (dim * 87)], [310 + (dim * 1), 480 + (dim * 87)], [300 + (dim * 1), 385 + (dim * 87)], false, [0, 0], 'sand', [])
    regionsList[36] = new Region(36, 1, [500 + (dim * 1), 290 + (dim * 87)], [670 + (dim * 1), 290 + (dim * 87)], [715 + (dim * 1), 220 + (dim * 87)], false, [0, 0], 'sand', [])
    regionsList[37] = new Region(37, 1, [720 + (dim * 1), 480 + (dim * 87)], [535 + (dim * 1), 480 + (dim * 87)], [730 + (dim * 1), 415 + (dim * 87)], false, [0, 0], 'sand', [])
    regionsList[38] = new Region(38, 1, [320 + (dim * 0), 180 + (dim * 123)], [540 + (dim * 0), 360 + (dim * 123)], [515 + (dim * 0), 290 + (dim * 123)], false, [0, 0], 'sand', [])
    regionsList[39] = new Region(39, 1, [440 + (dim * 41), 420 + (dim * 113)], [420 + (dim * 41), 570 + (dim * 113)], [600 + (dim * 41), 515 + (dim * 113)], false, [0, 0], 'sand', [])
    regionsList[60] = new Region(60, 1, [235 + (dim * 101), 435 + (dim * 81)], [350 + (dim * 101), 430 + (dim * 81)], [410 + (dim * 101), 300 + (dim * 81)], false, [0, 0], 'grassland', [])
    regionsList[61] = new Region(61, 1, [965 + (dim * 101), 440 + (dim * 81)], [845 + (dim * 101), 315 + (dim * 81)], [1140 + (dim * 101), 345 + (dim * 81)], false, [0, 0], 'grassland', [])
    regionsList[62] = new Region(62, 1, [815 + (dim * 101), 70 + (dim * 123)], [925 + (dim * 101), 165 + (dim * 123)], [1100 + (dim * 101), 115 + (dim * 123)], false, [0, 0], 'grassland', [])
    regionsList[63] = new Region(63, 1, [895 + (dim * 101), 455 + (dim * 123)], [560 + (dim * 101), 345 + (dim * 123)], [850 + (dim * 101), 370 + (dim * 123)], false, [0, 0], 'grassland', [])
    regionsList[64] = new Region(64, 1, [770 + (dim * 83), 200 + (dim * 117)], [645 + (dim * 83), 230 + (dim * 117)], [875 + (dim * 83), 185 + (dim * 117)], false, [0, 0], 'grassland', [])
    regionsList[65] = new Region(65, 1, [450 + (dim * 83), 340 + (dim * 117)], [470 + (dim * 83), 430 + (dim * 117)], [625 + (dim * 83), 385 + (dim * 117)], false, [0, 0], 'grassland', [])
    regionsList[66] = new Region(66, 1, [450 + (dim * 83), 340 + (dim * 117)], [470 + (dim * 83), 430 + (dim * 117)], [625 + (dim * 83), 385 + (dim * 117)], false, [0, 0], 'grassland', [])
    regionsList[67] = new Region(67, 1, [125 + (dim * 97), 285 + (dim * 148)], [300 + (dim * 97), 290 + (dim * 148)], [95 + (dim * 97), 145 + (dim * 148)], false, [0, 0], 'grassland', [])
    regionsList[68] = new Region(68, 1, [590 + (dim * 97), 350 + (dim * 148)], [700 + (dim * 97), 425 + (dim * 148)], [575 + (dim * 97), 490 + (dim * 148)], false, [0, 0], 'grassland', [])
    regionsList[69] = new Region(69, 1, [1105 + (dim * 97), 420 + (dim * 148)], [1000 + (dim * 97), 500 + (dim * 148)], [1045 + (dim * 97), 340 + (dim * 148)], false, [0, 0], 'grassland', [])

}


/**
 * Builds a Gameboard that is 90x72. By calling an index of the gameboard, the user is able to return whether or not the
 * tile is a land tile, it will return the region number and the territory type.
 */
function BuildBoard() {
    var gameboard = [];

    for (var i = 0; i < 130; i++) {
        gameboard[i] = new Array(130);
    }

    //console.log(data);
    //const testData = [0,1,2,3]
    var counter = 0;
    for (var x = 0; x < 130; x++) {
        for (var y = 0; y < 130; y++) {
            // let csvVal = data[130 * y + x];
            let csvVal = data[counter];

            if (csvVal >= 10 && csvVal <= 19) {
                gameboard[x][y] = csvVal;
            } else if (csvVal >= 60 && csvVal <= 69) {
                gameboard[x][y] = csvVal;
            } else if (csvVal >= 40 && csvVal <= 50) {
                gameboard[x][y] = csvVal;
            } else if (csvVal >= 29 && csvVal <= 39) {
                gameboard[x][y] = csvVal;
            } else if (csvVal == 0 || csvVal == -1 || csvVal == 160) {
                gameboard[x][y] = csvVal;
            }
            counter++;
        }
    }

    // for (var i = 0; i < 90; i++){
    //     var str = '';
    //     gameboard[i].forEach((element) => {
    //         str += element.region + ' '; 
    //     });
    //     console.log(str);
    // }

    return gameboard;
}

// function StartGame(regionArray) {
//     this.regionArray.forEach((region) => region.troopCount += 4);
//     this.regionArray[0].enemyHero = true;
//     this.regionArray[12].friendlyHero = true;
// }

// ===================================================================
// End - Utility Functions
// ===================================================================

// ===================================================================
// Start - Menu Functions
// ===================================================================
function moveFight(source, destination) {
    if (destination.owner === source.owner || destination.troops === []) {
        while (source.troops.length() > 0) destination.troops.push(source.troops.pop()); // Pushes troops from one destination to the next.
    } else {
        source.cap ? atkPow = source.troops.length() * 2 : atkPow = source.troops.length();
        destination.cap ? defPow = destination.troops.length() * 2 : defPow = destination.troops.length();

        while (defPow > 0 && atkPow > 0) {
            if (Math.random() > 0.5) {
                atkPow--
                if (!source.cap || (source.cap && atkPow % 2 == 1)) source.troops.pop();
            } else {
                defPow--;
            }
        }

        if (atkPow > defPow) {
            destination.owner = source.owner;
            region1.troops = [];
            return true; // Attacker won
        } else {
            region1.troops = [];
            return false; // Defender won
        }
    }
}

function buildBldg(type, region, player) {
    if (type == 'farm' || type == 'barracks') {
        region.bldg.push(new Building(type, 1));
        player.moneyCount--;
    }
}

function buildTroop(type, region, player) {
    if (type == 'captain' || type == 'soldier') {
        region.troops.push(new Troop(type, 1));
        player.moneyCount--;
    }
}

// ===================================================================
// End - Menu Functions
// ===================================================================


// ===================================================================
// Start - Resource Display
// ===================================================================
function ResourceDisplay(game) {
    this.border = AM.getAsset("./img/sidebar/resource_display.png");
    this.foodIcon = AM.getAsset("./img/sidebar/food_icon.png")
    this.moneyIcon = AM.getAsset("./img/sidebar/money_icon.png")
    Entity.call(this, game, gameEngine.surfaceWidth - 380, 0);
}

ResourceDisplay.prototype = new Entity();
ResourceDisplay.prototype.constructor = ResourceDisplay;

ResourceDisplay.prototype.draw = function (ctx) {
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";

    // Draw the border
    ctx.drawImage(this.border, this.x, this.y);

    // Draw the Food Icon and Count
    ctx.drawImage(this.foodIcon, this.x + 30, this.y + 10);
    ctx.fillText(this.foodCount, this.x + 70, this.y + 35);

    // Draw the Money Icon and Count
    ctx.drawImage(this.moneyIcon, this.x + 130, this.y + 10);
    ctx.fillText(this.moneyCount, this.x + 160, this.y + 35);
}
// ===================================================================
// End - Resource Display
// ===================================================================



// ===================================================================
// Start - Map Display
// ===================================================================
function MapDisplay(game) {
    this.border = AM.getAsset("./img/map/map_master4.png");
    Entity.call(this, game, 0, 0);
}

MapDisplay.prototype = new Entity();
MapDisplay.prototype.constructor = MapDisplay;

MapDisplay.prototype.update = function (ctx) {
}

MapDisplay.prototype.draw = function (ctx) {
    ctx.drawImage(this.border, cameraOrigin.x * dim, cameraOrigin.y * dim,
        bgWidth, bgHeight,
        0, 0,
        modbgWidth, modbgHeight);

    // **Debug code** Displays Region ID on map
    if (debug && debugGrid) {



        var xCal = 2;
        var yCal = -3;
        for (var i = 0; i < gameEngine.surfaceWidth / dim; i++) {
            for (var j = 0; j < gameEngine.surfaceHeight / dim; j++) {
                // add sahdows to numbers
                ctx.fillStyle = "black";
                ctx.font = "8px Arial";
                ctx.fillText(onScreenRegions[i][j].name, (i * dim) + xCal + 1, ((j + 1) * dim) + yCal + 1);

                //displays numbers
                ctx.fillStyle = "white";
                ctx.font = "8px Arial";
                ctx.fillText(onScreenRegions[i][j].name, (i * dim) + xCal, ((j + 1) * dim) + yCal);

                // displays rectangles
                ctx.strokeStyle = "black";
                ctx.strokeRect(i * dim, j * dim, dim, dim);
            }
        }
    }


}
// ===================================================================
// End - Map Display
// ===================================================================



// ===================================================================
// Start - Minimap Display
// ===================================================================
function MinimapDisplay(game) {
    this.border = AM.getAsset("./img/map/map_master4.png");
    this.minimapBorderWidth = 204;
    this.miniMapBorderHeight = 204;


    this.aspectRatio = Math.min(((this.minimapBorderWidth - 10) / bgWidth),
        ((this.miniMapBorderHeight - 10) / bgHeight));

    this.smWidth = (bgWidth * Number(this.aspectRatio)).toFixed(0); // Width of the shrunk map
    this.smHeight = (bgHeight * Number(this.aspectRatio)).toFixed(0); // Height of the shunk map
    console.log("bgWidth " + bgWidth)
    console.log("bgHeight " + bgHeight)
    console.log("w " + this.smWidth)
    console.log("h " + this.smHeight)


    this.originX = ((this.minimapBorderWidth / 2) - (this.smWidth / 2)).toFixed(0); // Start point of image in mini map
    this.originY = ((this.miniMapBorderHeight / 2) - (this.smHeight / 2)).toFixed(0); // Start point of image in mini map
    console.log("origX " + this.originX)
    console.log("origY " + this.originY)

    this.xMax = ((bgWidth / dim) - (gameEngine.surfaceWidth / dim)).toFixed(0);
    this.yMax = ((bgHeight / dim) - (gameEngine.surfaceHeight / dim)).toFixed(0);
    console.log("bgWidth " + bgWidth)
    console.log("bgHeight " + bgHeight)
    console.log("xMax " + this.xMax)
    console.log("yMax " + this.yMax)

    Entity.call(this, game, 0, 0);
}

MinimapDisplay.prototype = new Entity();
MinimapDisplay.prototype.constructor = MinimapDisplay;

MinimapDisplay.prototype.update = function (ctx) {
    var click = gameEngine.click;
    if (click != null &&
        click.x >= this.originX &&
        click.y >= this.originY &&
        click.x <= this.smWidth &&
        click.y <= this.smWidth) {
        if (debug) {
            console.log("%c Minimap click below this:", "background: #222; color: #bada55");
        }

        // Grabs the click on the minimap
        var xClickOnMinimap = ((click.x - this.originX) / this.aspectRatio / dim).toFixed(0);
        var yClickOnMinimap = ((click.y - this.originY) / this.aspectRatio / dim).toFixed(0);

        if (debug) {
            console.log("xClickOnMinimap --- " + xClickOnMinimap);
            console.log("yClickOnMinimap --- " + yClickOnMinimap);
        }

        // Translates the minimap click to set the point in the map
        var xTranslationToMap = (Number(xClickOnMinimap) - ((Number(gameEngine.surfaceWidth) * Number(this.aspectRatio)) / 2)).toFixed(0);
        var yTranslationToMap = (Number(yClickOnMinimap) - ((Number(gameEngine.surfaceHeight) * Number(this.aspectRatio)) / 2)).toFixed(0);
        console.log("translation x --- " + xTranslationToMap);
        console.log("translation y --- " + yTranslationToMap);

        // Takes care of clipping to edges of map
        if (Number(xTranslationToMap) >= Number(this.xMax)) {
            xTranslationToMap = this.xMax;
            if (debug) {
                console.log("triggered 1");
            }

        }
        if (Number(xTranslationToMap) <= 0) {
            xTranslationToMap = 0;
            if (debug) {
                console.log("triggered 2");
            }
        }
        if (Number(yTranslationToMap) >= Number(this.yMax)) {
            yTranslationToMap = this.yMax;
            if (debug) {
                console.log("triggered 3");
            }
        }
        if (Number(yTranslationToMap) <= 0) {
            yTranslationToMap = 0;
            if (debug) {
                console.log("triggered 4");
            }
        }

        changeCameraOrigin(xTranslationToMap, yTranslationToMap);
        // createArray(cameraOrigin);
        console.log(cameraOrigin);


        if (debug) {
            console.log("translation x --- " + xTranslationToMap);
            console.log("translation y --- " + yTranslationToMap);
            console.log("x max --- " + this.xMax);
            console.log("y max --- " + this.yMax);
            console.log("camera origin x --- " + cameraOrigin["x"]);
            console.log("camera origin y --- " + cameraOrigin["y"]);
        }


        gameEngine.click = null;
    } else if (click != null &&
        click.x <= this.minimapBorderWidth &&
        click.y <= this.miniMapBorderHeight) {
        gameEngine.click = null; // Ignores click if click outside of shrunk map
    }
}

MinimapDisplay.prototype.draw = function (ctx) {
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";

    // Draws the border
    ctx.strokeRect(0, 0, this.minimapBorderWidth, this.miniMapBorderHeight);
    ctx.fillRect(0, 0, this.minimapBorderWidth, this.miniMapBorderHeight);

    // Draws the shrunk map
    ctx.drawImage(this.border, 0, 0,
        bgWidth, bgHeight,
        this.originX,
        this.originY,
        this.smWidth, this.smHeight);

    // Draws the vision rectangle
    ctx.lineWidth = 2;
    ctx.strokeRect(Number(this.originX) + Number((cameraOrigin.x * (dim * this.aspectRatio))),
        Number(this.originY) + Number((cameraOrigin.y * (dim * this.aspectRatio))),
        Number(gameEngine.surfaceWidth) * Number(this.aspectRatio),
        Number(gameEngine.surfaceHeight) * Number(this.aspectRatio));
}
// ===================================================================
// End - Minimap Display
// ===================================================================



// ===================================================================
// Start - Control Display
// ===================================================================
function ControlDisplay(game) {

    this.btnDim = 80;
    this.buttonIcon = AM.getAsset("./img/control/button.png")

    this.actionIconOn = AM.getAsset("./img/control/action_on.png")
    this.actionIconOff = AM.getAsset("./img/control/action_off.png")
    this.fightIcon = AM.getAsset("./img/control/fight.png")
    this.moveIcon = AM.getAsset("./img/control/move.png")

    this.buildIconOn = AM.getAsset("./img/control/build_on.png")
    this.buildIconOff = AM.getAsset("./img/control/build_off.png")
    this.barracksIcon = AM.getAsset("./img/control/barracks_on.png")
    this.siloIcon = AM.getAsset("./img/control/silo2.png")

    this.troopIconOn = AM.getAsset("./img/control/build_troop_on.png")
    this.troopIconOff = AM.getAsset("./img/control/build_troop_off.png")
    this.soldierIcon = AM.getAsset("./img/control/soldier5.png")

    this.endTurnIconOn = AM.getAsset("./img/control/end_turn_on.png")
    this.endTurnIconOff = AM.getAsset("./img/control/end_turn_off.png")

    this.isActivate = true;

    var w = gameEngine.surfaceWidth;
    var h = gameEngine.surfaceHeight;
    this.aBtn = { x: w - this.btnDim * 4, y: h - this.btnDim };
    this.tBtn = { x: w - this.btnDim * 3, y: h - this.btnDim };
    this.bBtn = { x: w - this.btnDim * 2, y: h - this.btnDim };
    this.eTBtn = { x: w - this.btnDim * 1, y: h - this.btnDim };

    this.a_moveBtn = { x: w - this.btnDim * 4, y: h - this.btnDim * 2 };
    this.t_infBtn = { x: w - this.btnDim * 3, y: h - this.btnDim * 2 };
    this.b_farmBtn = { x: w - this.btnDim * 2, y: h - this.btnDim * 2 };
    this.b_barBtn = { x: w - this.btnDim * 3, y: h - this.btnDim * 2 };

    this.menu = [{ name: "action", x: this.aBtn.x, y: this.aBtn.y, w: this.btnDim, h: this.btnDim },
    { name: "troop", x: this.tBtn.x, y: this.tBtn.y, w: this.btnDim, h: this.btnDim },
    { name: "building", x: this.bBtn.x, y: this.bBtn.y, w: this.btnDim, h: this.btnDim },
    { name: "endTurn", x: this.eTBtn.x, y: this.eTBtn.y, w: this.btnDim, h: this.btnDim }];

    this.actionFlag = false;
    this.troopFlag = false;
    this.buildingFlag = false;

    this.actionActivate = false;
    this.troopActivate = false;
    this.buildingActivate = false;
    this.endTurnActivate = false;

    Entity.call(this, game, 0, 0);
}

ControlDisplay.prototype = new Entity();
ControlDisplay.prototype.constructor = ControlDisplay;

// max x=1438; x changes by the size of the map display
ControlDisplay.prototype.update = function (ctx) {
    var click = gameEngine.click;
    var that = this;

    if (this.isActivate) {
        toggleAllOn();
        if (click !== null) {
            var x = getClickedItem(this.menu, click.x, click.y);
            if (x !== null) {
                if (x.name === "action") {
                    toggleAllOff();
                    this.actionFlag = true;
                    click = null;
                }
                if (x.name === "troop") {
                    toggleAllOff();
                    this.troopFlag = true;
                    click = null;
                }
                if (x.name === "building") {
                    toggleAllOff();
                    this.buildingFlag = true;
                    click = null;
                }
                if (x.name === "endTurn") {
                    toggleAllOff();
                }
            } else {
                toggleAllOff();
            }
        }

    }

    function toggleAllOff() {
        that.actionFlag = false;
        that.troopFlag = false;
        that.buildingFlag = false;
    }

    function toggleAllOn() {
        that.actionActivate = true;
        that.troopActivate = true;
        that.buildingActivate = true;
        that.endTurnActivate = true;
    }


}

ControlDisplay.prototype.draw = function (ctx) {
    ctx.fillStyle = "#9e9e9e";
    ctx.strokeStyle = "black";

    // Displays four mega menus
    ctx.drawImage(this.buttonIcon, this.aBtn.x, this.aBtn.y, this.btnDim, this.btnDim);
    ctx.drawImage(this.buttonIcon, this.tBtn.x, this.tBtn.y, this.btnDim, this.btnDim);
    ctx.drawImage(this.buttonIcon, this.bBtn.x, this.bBtn.y, this.btnDim, this.btnDim);
    ctx.drawImage(this.buttonIcon, this.eTBtn.x, this.eTBtn.y, this.btnDim, this.btnDim);

    if (this.actionActivate || this.buildingActivate || this.troopActivate || this.endTurnActivate) {
        ctx.drawImage(this.actionIconOn, this.aBtn.x + 10, this.aBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        ctx.drawImage(this.troopIconOn, this.tBtn.x + 10, this.tBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        ctx.drawImage(this.buildIconOn, this.bBtn.x + 10, this.bBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        ctx.drawImage(this.endTurnIconOn, this.eTBtn.x + 10, this.eTBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
    } else {
        ctx.drawImage(this.actionIconOff, this.aBtn.x + 10, this.aBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        ctx.drawImage(this.troopIconOff, this.tBtn.x + 10, this.tBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        ctx.drawImage(this.buildIconOff, this.bBtn.x + 10, this.bBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        ctx.drawImage(this.endTurnIconOff, this.eTBtn.x + 10, this.eTBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
    }




    if (this.actionFlag) {
        ctx.drawImage(this.buttonIcon, this.a_moveBtn.x, this.a_moveBtn.y, this.btnDim, this.btnDim);
        ctx.drawImage(this.fightIcon, this.a_moveBtn.x + 10, this.a_moveBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        if (debug) {
            console.log("ac" + this.actionFlag);
            console.log("tr" + this.troopFlag);
            console.log("bu" + this.buildingFlag);
        }
    }


    if (this.troopFlag) {
        ctx.drawImage(this.buttonIcon, this.t_infBtn.x, this.t_infBtn.y, this.btnDim, this.btnDim);
        ctx.drawImage(this.soldierIcon, this.t_infBtn.x + 10, this.t_infBtn.y + 10, this.btnDim - 20, this.btnDim - 20);

        if (debug) {
            console.log("ac" + this.actionFlag);
            console.log("tr" + this.troopFlag);
            console.log("bu" + this.buildingFlag);
        }
    }


    if (this.buildingFlag) {
        ctx.drawImage(this.buttonIcon, this.b_farmBtn.x, this.b_farmBtn.y, this.btnDim, this.btnDim);
        ctx.drawImage(this.buttonIcon, this.b_barBtn.x, this.b_barBtn.y, this.btnDim, this.btnDim);

        ctx.drawImage(this.barracksIcon, this.b_barBtn.x + 10, this.b_barBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        ctx.drawImage(this.siloIcon, this.b_farmBtn.x + 10, this.b_farmBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        if (debug) {
            console.log("ac" + this.actionFlag);
            console.log("tr" + this.troopFlag);
            console.log("bu" + this.buildingFlag);
        }
    }
}
// ===================================================================
// End - Control Display
// ===================================================================



// ===================================================================
// Start - Input Handler
// ===================================================================
function InputHandler(game) {
    this.keyXMax = ((bgWidth / dim) - (gameEngine.surfaceWidth / dim)).toFixed(0);
    this.keyYMax = ((bgHeight / dim) - (gameEngine.surfaceHeight / dim)).toFixed(0);
    this.sensitivity = 1;
    Entity.call(this, game, 0, 0);
}

InputHandler.prototype = new Entity();
InputHandler.prototype.constructor = MapDisplay;

InputHandler.prototype.update = function (ctx) {
    // Control for WASD map movement
    var key = gameEngine.keyDown;
    if (key != null) {
        if (key["code"] === "KeyW") {
            if (Number(cameraOrigin.y) - Number(this.sensitivity) > 0) {
                changeCameraOrigin(cameraOrigin.x, Number(cameraOrigin.y) - Number(this.sensitivity));
                createArray(cameraOrigin);
                if (debug) {
                    console.log("%c RegionArray below this:", "background: #222; color: #bada55");
                    console.log(onScreenRegions);
                }
            } else {
                changeCameraOrigin(cameraOrigin.x, 0);
            }

        }
        else if (key["code"] === "KeyA") {
            if (Number(cameraOrigin.x) - Number(this.sensitivity) > 0) {
                changeCameraOrigin(Number(cameraOrigin.x) - Number(this.sensitivity), cameraOrigin.y);
                // cameraOrigin.x--;
                createArray(cameraOrigin);
                if (debug) {
                    console.log("%c RegionArray below this:", "background: #222; color: #bada55");
                    console.log(onScreenRegions);
                }
            } else {
                changeCameraOrigin(0, cameraOrigin.y);
            }
        }
        else if (key["code"] === "KeyS") {
            if (Number(cameraOrigin.y) + Number(this.sensitivity) < this.keyYMax) {
                changeCameraOrigin(cameraOrigin.x, Number(cameraOrigin.y) + Number(this.sensitivity));
                createArray(cameraOrigin);
                if (debug) {
                    console.log("%c RegionArray below this:", "background: #222; color: #bada55");
                    console.log(onScreenRegions);
                }
            } else {
                changeCameraOrigin(cameraOrigin.x, this.keyYMax);
            }


        }
        else if (key["code"] === "KeyD") {
            if (Number(cameraOrigin.x) + Number(this.sensitivity) < Number(this.keyXMax)) {
                changeCameraOrigin(Number(cameraOrigin.x) + Number(this.sensitivity), cameraOrigin.y);
                createArray(cameraOrigin);
                if (debug) {
                    console.log("%c RegionArray below this:", "background: #222; color: #bada55");
                    console.log(onScreenRegions);
                }

            } else {
                changeCameraOrigin(this.keyXMax, cameraOrigin.y);
            }
        }
        console.log(key["code"])
        console.log(cameraOrigin);
        gameEngine.keyDown = null;

    }



    // Control clicks on the map
    var click = gameEngine.click;
    if (click != null) {

        var regionClicked = getClickedRegion(onScreenRegions, click.x, click.y);
        console.log("%c Region clicked below this:", "background: #222; color: #bada55");
        console.log(click);
        console.log(regionClicked);
        console.log("True Location --- " + (Number(dim * cameraOrigin.x) + Number(click.x)) + ", " +
            (Number(dim * cameraOrigin.y) + Number(click.y)));

        gameEngine.click = null;
    }

    // Control wheel events
    // if (gameEngine.zoomIn) {
    //     modbgWidth *= 1.02;
    //     modbgHeight *= 1.02;
    //     dim *= 1.02;
    //     gameEngine.zoomIn = false;
    // }
    // if (gameEngine.zoomOut) {
    //     modbgWidth /= 1.02;
    //     modbgHeight /= 1.02;
    //     dim /= 1.02;
    //     gameEngine.zoomOut = false;
    // }

}

// ===================================================================
// End - Input Controller
// ===================================================================



// ===================================================================
// Start - Audio Handler
// ===================================================================
function AudioHandler(game) {
    var audio = new Audio("./sound/bg_music.mp3");
    audio.play();
    Entity.call(this, game, 0, 0);
}

AudioHandler.prototype = new Entity();
AudioHandler.prototype.constructor = AudioHandler;

AudioHandler.prototype.update = function (ctx) {
}


AudioHandler.prototype.draw = function (ctx) {
}
// ===================================================================
// End - Audio Handler
// ===================================================================

// ===================================================================
// Start - Sprite Handler
// ===================================================================
function SpriteHandler(game) {
    var audio = new Audio("./sound/bg_music.mp3");
    audio.play();
    Entity.call(this, game, 0, 0);
}

SpriteHandler.prototype = new Entity();
SpriteHandler.prototype.constructor = SpriteHandler;

SpriteHandler.prototype.update = function (ctx) {

}


SpriteHandler.prototype.draw = function (ctx) {

}
// ===================================================================
// End - Sprite Handler
// ===================================================================



// ===================================================================
// Start - Welcome Screen
// ===================================================================

function WelcomeScreen(game) {
    // Welcome Screen Background
    this.animation = new Animation(AM.getAsset("./img/welcome_screen.png"), 1280, 720, 7680, .08, 6, true, 1);
    this.ctx = game.ctx;

    // New Game Button Paramters
    this.newGameButton = AM.getAsset("./img/button_new-game.png");
    this.ngbWidth = 270;
    this.ngbHeight = 72;
    this.ngbX = (gameEngine.surfaceWidth / 2) - (270 / 2); //This is to center the button
    this.ngbY = 500; //Y-coordinate of button

    // Hitboxes for the buttons
    this.hitBoxes = [{ name: "newGame", x: this.ngbX, y: this.ngbY, w: this.ngbWidth, h: this.ngbHeight }];

    this.audio = new Audio("./sound/welcome_music.mp3");
    this.audio.autoplay = true;
    this.audio.play();


    Entity.call(this, game, 0, 0);
}

WelcomeScreen.prototype = new Entity();
WelcomeScreen.prototype.constructor = WelcomeScreen;

WelcomeScreen.prototype.update = function (ctx) {

    if (gameEngine.click != null) {

        var hit = getClickedItem(this.hitBoxes, gameEngine.click.x, gameEngine.click.y);

        if (debug) {
            console.log(gameEngine.click);
            console.log(this.hitBoxes);
            console.log(hit);
        }

        if (hit != null && hit.name === "newGame") {
            gameEngine.newGame = true;
        }

        gameEngine.click = null;
    }
    if (gameEngine.newGame) {
        this.removeFromWorld = true;
        gameEngine.addEntity(new MapDisplay(gameEngine));


        // function Region(id, owner, troopCoord, troops, bldgCoord, bldgs, territory, neighbors, troopCount) {
        //     this.id = id,
        //         this.owner = owner,
        //         this.troopCoord = troopCoord,
        //         this.troops = troops,
        //         this.bldgX = bldgCoord,
        //         this.bldgY = bldgs,
        //         this.territory = territory,
        //         this.neighbors = neighbors,
        //         this.troopCount = troopCount
        // }


        // function BuildRegions() {
        //     let Regions = [
        //         new Region('S - SW', false, 1, 40, 560, 40, 560, 'orange', [2, 3, 5], 0),
        //         new Region('S - SE', false, 1, 210, 560, 210, 560, 'orange', [1, 3, 16], 0),
        //         new Region('S - E', false, 1, 110, 460, 110, 460, 'orange', [1, 2, 4, 5], 0),
        //         new Region('S - NE', false, 1, 110, 290, 110, 290, 'orange', [3, 5, 6, 7, 14], 0),
        //         new Region('S - NW', false, 1, 40, 290, 40, 290, 'orange', [1, 3, 4, 6], 0),
        //         new Region('D - S', false, 0, 40, 240, 40, 240, 'green', [4, 5, 7, 8], 0),
        //         new Region('D - NW', false, 0, 120, 70, 40, 70, 'green', [4, 6, 8, 9, 10, 11], 0),
        //         new Region('D - E', false, 0, 280, 70, 280, 70, 'green', [6, 7], 0),
        //         new Region('I - NW', false, 0, 390, 30, 390, 30, 'grey', [7, 10, 12], 0),
        //         new Region('I - W', false, 0, 390, 120, 390, 120, 'grey', [7, 9, 11, 12], 0),
        //         new Region('I - SW', false, 0, 390, 210, 390, 210, 'grey', [7, 10, 14], 0),
        //         new Region('I - Mid', false, 0, 610, 30, 610, 30, 'grey', [9, 10, 13], 0),
        //         new Region('I - E', false, 0, 730, 30, 730, 30, 'grey', [12, 14], 0),
        //         new Region('G - N', false, 1, 460, 380, 460, 380, 'yellow', [4, 11, 15, 16], 0),
        //         new Region('G - SE', false, 1, 690, 520, 690, 520, 'yellow', [14], 0),
        //         new Region('G - SW', false, 1, 460, 520, 460, 580, 'yellow', [2, 14], 0),
        //     ];


        //     return Regions;
        // }

        // Region[10].bldg.push(new Barracks(gameEngine, 0, Region[10].bldgXY[0], Region[10].bldgXY[1]));
        //Plains
        //15
        gameEngine.addEntity(new Barracks(gameEngine, 0, 150, 260));
        gameEngine.addEntity(new Farm(gameEngine, 0, 250, 185));
        gameEngine.addEntity(new AlienCaptain(gameEngine, 460, 270));

        //16
        gameEngine.addEntity(new Barracks(gameEngine, 0, 470, 345));
        gameEngine.addEntity(new Farm(gameEngine, 0, 445, 425));
        gameEngine.addEntity(new SoldierCaptain(gameEngine, 345, 450));

        //19
        gameEngine.addEntity(new Barracks(gameEngine, 0, 285, 665));
        gameEngine.addEntity(new Farm(gameEngine, 0, 245, 750));
        gameEngine.addEntity(new Soldier(gameEngine, 235, 690));

        //17
        gameEngine.addEntity(new Barracks(gameEngine, 0, 610, 205));
        gameEngine.addEntity(new Farm(gameEngine, 0, 610, 355));
        gameEngine.addEntity(new Soldier(gameEngine, 680, 440));

        //14
        gameEngine.addEntity(new Barracks(gameEngine, 0, 300 + (dim * 0), 200 + (dim * 68)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 230 + (dim * 0), 450 + (dim * 54)));
        gameEngine.addEntity(new Soldier(gameEngine, 220 + (dim * 0), 295 + (dim * 55)));

        //13
        gameEngine.addEntity(new Barracks(gameEngine, 0, 275 + (dim * 19), 330 + (dim * 61)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 275 + (dim * 19), 415 + (dim * 61)));
        gameEngine.addEntity(new Soldier(gameEngine, 305 + (dim * 19), 290 + (dim * 61)));

        //18
        gameEngine.addEntity(new Barracks(gameEngine, 0, 310 + (dim * 20), 265 + (dim * 22)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 480 + (dim * 20), 265 + (dim * 22)));
        gameEngine.addEntity(new Soldier(gameEngine, 445 + (dim * 20), 335 + (dim * 22)));

        //12
        gameEngine.addEntity(new Barracks(gameEngine, 0, 540 + (dim * 22), 200 + (dim * 54)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 530 + (dim * 22), 450 + (dim * 54)));
        gameEngine.addEntity(new Soldier(gameEngine, 605 + (dim * 22), 290 + (dim * 54)));

        //10
        gameEngine.addEntity(new Barracks(gameEngine, 0, 520 + (dim * 50), 265 + (dim * 29)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 410 + (dim * 50), 445 + (dim * 29)));
        gameEngine.addEntity(new Soldier(gameEngine, 525 + (dim * 50), 380 + (dim * 29)));

        //11
        gameEngine.addEntity(new Barracks(gameEngine, 0, 300 + (dim * 59), 455 + (dim * 46)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 455 + (dim * 59), 560 + (dim * 46)));
        gameEngine.addEntity(new Soldier(gameEngine, 605 + (dim * 59), 515 + (dim * 46)));


        //Tundra
        //45
        gameEngine.addEntity(new Barracks(gameEngine, 0, 635 + (dim * 37), 60 + (dim * 3)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 660 + (dim * 37), 140 + (dim * 3)));
        gameEngine.addEntity(new Soldier(gameEngine, 555 + (dim * 37), 140 + (dim * 3)));

        //46
        gameEngine.addEntity(new Barracks(gameEngine, 0, 390 + (dim * 61), 465 + (dim * 0)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 210 + (dim * 61), 440 + (dim * 0)));
        gameEngine.addEntity(new Soldier(gameEngine, 350 + (dim * 61), 360 + (dim * 0)));

        //47
        gameEngine.addEntity(new Barracks(gameEngine, 0, 640 + (dim * 61), 410 + (dim * 0)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 575 + (dim * 61), 115 + (dim * 0)));
        gameEngine.addEntity(new Soldier(gameEngine, 590 + (dim * 61), 280 + (dim * 0)));

        //48
        gameEngine.addEntity(new Barracks(gameEngine, 0, 310 + (dim * 101), 320 + (dim * 0)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 310 + (dim * 101), 580 + (dim * 0)));
        gameEngine.addEntity(new Soldier(gameEngine, 460 + (dim * 101), 315 + (dim * 0)));

        //49
        gameEngine.addEntity(new Barracks(gameEngine, 0, 965 + (dim * 101), 420 + (dim * 0)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 965 + (dim * 101), 300 + (dim * 0)));
        gameEngine.addEntity(new Soldier(gameEngine, 1100 + (dim * 101), 230 + (dim * 0)));

        //43
        gameEngine.addEntity(new Barracks(gameEngine, 0, 735 + (dim * 101), 100 + (dim * 0)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 750 + (dim * 101), 310 + (dim * 0)));
        gameEngine.addEntity(new Soldier(gameEngine, 800 + (dim * 101), 220 + (dim * 0)));

        //44
        gameEngine.addEntity(new Barracks(gameEngine, 0, 590 + (dim * 101), 410 + (dim * 21)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 665 + (dim * 101), 335 + (dim * 21)));
        gameEngine.addEntity(new Soldier(gameEngine, 580 + (dim * 101), 300 + (dim * 21)));

        //42
        gameEngine.addEntity(new Barracks(gameEngine, 0, 975 + (dim * 101), 240 + (dim * 38)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 1085 + (dim * 101), 250 + (dim * 38)));
        gameEngine.addEntity(new Soldier(gameEngine, 940 + (dim * 101), 245 + (dim * 38)));

        //50
        gameEngine.addEntity(new Barracks(gameEngine, 0, 450 + (dim * 101), 380 + (dim * 42)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 335 + (dim * 101), 275 + (dim * 42)));
        gameEngine.addEntity(new Soldier(gameEngine, 530 + (dim * 101), 310 + (dim * 42)));

        //40
        gameEngine.addEntity(new Barracks(gameEngine, 0, 680 + (dim * 101), 140 + (dim * 61)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 570 + (dim * 101), 480 + (dim * 61)));
        gameEngine.addEntity(new Soldier(gameEngine, 525 + (dim * 101), 410 + (dim * 61)));

        //41
        gameEngine.addEntity(new Barracks(gameEngine, 0, 880 + (dim * 101), 285 + (dim * 55)));
        gameEngine.addEntity(new Farm(gameEngine, 0, 1010 + (dim * 101), 475 + (dim * 55)));
        gameEngine.addEntity(new Soldier(gameEngine, 1055 + (dim * 101), 163 + (dim * 55)));

        //Sand
        //35
        gameEngine.addEntity(new Barracks(gameEngine, 1, 295 + (dim * 1), 280 + (dim * 87)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 310 + (dim * 1), 480 + (dim * 87)));
        gameEngine.addEntity(new Alien(gameEngine, 300 + (dim * 1), 385 + (dim * 87)));

        //36
        gameEngine.addEntity(new Barracks(gameEngine, 1, 500 + (dim * 1), 290 + (dim * 87)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 670 + (dim * 1), 290 + (dim * 87)));
        gameEngine.addEntity(new Alien(gameEngine, 715 + (dim * 1), 220 + (dim * 87)));

        //37
        gameEngine.addEntity(new Barracks(gameEngine, 1, 720 + (dim * 1), 480 + (dim * 87)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 535 + (dim * 1), 480 + (dim * 87)));
        gameEngine.addEntity(new Alien(gameEngine, 730 + (dim * 1), 415 + (dim * 87)));

        //34
        gameEngine.addEntity(new Barracks(gameEngine, 1, 570 + (dim * 41), 75 + (dim * 113)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 500 + (dim * 41), 270 + (dim * 113)));
        gameEngine.addEntity(new Alien(gameEngine, 675 + (dim * 41), 175 + (dim * 113)));

        //39
        gameEngine.addEntity(new Barracks(gameEngine, 1, 440 + (dim * 41), 420 + (dim * 113)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 420 + (dim * 41), 570 + (dim * 113)));
        gameEngine.addEntity(new Alien(gameEngine, 600 + (dim * 41), 515 + (dim * 113)));

        //33
        gameEngine.addEntity(new Barracks(gameEngine, 1, 140 + (dim * 0), 360 + (dim * 123)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 135 + (dim * 0), 480 + (dim * 123)));
        gameEngine.addEntity(new Alien(gameEngine, 190 + (dim * 0), 220 + (dim * 123)));

        //38
        gameEngine.addEntity(new Barracks(gameEngine, 1, 320 + (dim * 0), 180 + (dim * 123)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 540 + (dim * 0), 360 + (dim * 123)));
        gameEngine.addEntity(new Alien(gameEngine, 515 + (dim * 0), 290 + (dim * 123)));

        //32
        gameEngine.addEntity(new Barracks(gameEngine, 1, 295 + (dim * 0), 495 + (dim * 123)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 430 + (dim * 0), 565 + (dim * 123)));
        gameEngine.addEntity(new Alien(gameEngine, 595 + (dim * 0), 490 + (dim * 123)));

        //31
        gameEngine.addEntity(new Barracks(gameEngine, 1, 170 + (dim * 0), 385 + (dim * 148)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 315 + (dim * 0), 390 + (dim * 148)));
        gameEngine.addEntity(new Alien(gameEngine, 275 + (dim * 0), 555 + (dim * 148)));

        //30
        gameEngine.addEntity(new Barracks(gameEngine, 1, 590 + (dim * 0), 385 + (dim * 148)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 590 + (dim * 0), 495 + (dim * 148)));
        gameEngine.addEntity(new Alien(gameEngine, 510 + (dim * 0), 465 + (dim * 148)));

        //29
        gameEngine.addEntity(new Barracks(gameEngine, 1, 760 + (dim * 0), 310 + (dim * 148)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 770 + (dim * 0), 500 + (dim * 148)));
        gameEngine.addEntity(new Alien(gameEngine, 925 + (dim * 0), 430 + (dim * 148)));

        //Grassland
        //60
        gameEngine.addEntity(new Barracks(gameEngine, 1, 235 + (dim * 101), 435 + (dim * 81)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 350 + (dim * 101), 430 + (dim * 81)));
        gameEngine.addEntity(new Alien(gameEngine, 410 + (dim * 101), 300 + (dim * 81)));

        //61
        gameEngine.addEntity(new Barracks(gameEngine, 1, 965 + (dim * 101), 440 + (dim * 81)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 845 + (dim * 101), 315 + (dim * 81)));
        gameEngine.addEntity(new Alien(gameEngine, 1140 + (dim * 101), 345 + (dim * 81)));

        //65
        gameEngine.addEntity(new Barracks(gameEngine, 1, 260 + (dim * 83), 140 + (dim * 117)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 255 + (dim * 83), 225 + (dim * 117)));
        gameEngine.addEntity(new Alien(gameEngine, 425 + (dim * 83), 175 + (dim * 117)));

        //64
        gameEngine.addEntity(new Barracks(gameEngine, 1, 770 + (dim * 83), 200 + (dim * 117)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 645 + (dim * 83), 230 + (dim * 117)));
        gameEngine.addEntity(new Alien(gameEngine, 875 + (dim * 83), 185 + (dim * 117)));

        //66
        gameEngine.addEntity(new Barracks(gameEngine, 1, 450 + (dim * 83), 340 + (dim * 117)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 470 + (dim * 83), 430 + (dim * 117)));
        gameEngine.addEntity(new Alien(gameEngine, 625 + (dim * 83), 385 + (dim * 117)));

        //62
        gameEngine.addEntity(new Barracks(gameEngine, 1, 815 + (dim * 101), 70 + (dim * 123)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 925 + (dim * 101), 165 + (dim * 123)));
        gameEngine.addEntity(new Alien(gameEngine, 1100 + (dim * 101), 115 + (dim * 123)));

        //63
        gameEngine.addEntity(new Barracks(gameEngine, 1, 895 + (dim * 101), 455 + (dim * 123)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 560 + (dim * 101), 345 + (dim * 123)));
        gameEngine.addEntity(new Alien(gameEngine, 850 + (dim * 101), 370 + (dim * 123)));

        //67
        gameEngine.addEntity(new Barracks(gameEngine, 1, 125 + (dim * 97), 285 + (dim * 148)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 300 + (dim * 97), 290 + (dim * 148)));
        gameEngine.addEntity(new Alien(gameEngine, 340 + (dim * 97), 455 + (dim * 148)));

        //68
        gameEngine.addEntity(new Barracks(gameEngine, 1, 590 + (dim * 97), 350 + (dim * 148)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 700 + (dim * 97), 425 + (dim * 148)));
        gameEngine.addEntity(new Alien(gameEngine, 575 + (dim * 97), 490 + (dim * 148)));

        //69
        gameEngine.addEntity(new Barracks(gameEngine, 1, 1105 + (dim * 97), 420 + (dim * 148)));
        gameEngine.addEntity(new Farm(gameEngine, 1, 1000 + (dim * 97), 500 + (dim * 148)));
        gameEngine.addEntity(new Alien(gameEngine, 1045 + (dim * 97), 340 + (dim * 148)));




        // gameEngine.addEntity(new Alien(gameEngine, 300, 250));

        gameEngine.addEntity(new MinimapDisplay(gameEngine));
        gameEngine.addEntity(new ResourceDisplay(gameEngine));
        gameEngine.addEntity(new ControlDisplay(gameEngine));

        gameEngine.addEntity(new InputHandler(gameEngine));
        gameEngine.addEntity(new AudioHandler(gameEngine));
        gameEngine.addEntity(new SpriteHandler(gameEngine));
    }
}

WelcomeScreen.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    ctx.drawImage(this.newGameButton, this.ngbX, this.ngbY, this.ngbWidth, this.ngbHeight);
}
// ===================================================================
// End - Welcome SCreen
// ===================================================================



// ===================================================================
// Start - Main
// ===================================================================
function Main() {
    // Resource Display
    AM.queueDownload("./img/sidebar/resource_display.png");
    AM.queueDownload("./img/sidebar/food_icon.png");
    AM.queueDownload("./img/sidebar/money_icon.png");

    // Game Map Display
    AM.queueDownload("./img/map/map_master4.png");

    // Combat Entities 
    AM.queueDownload("./img/sprites/alien_animated.png");
    AM.queueDownload("./img/sprites/alien_standing.png");
    AM.queueDownload("./img/sprites/soldier_standing.png");
    AM.queueDownload("./img/sprites/soldier_animated.png");
    AM.queueDownload("./img/sprites/cap_alien_animated.png");
    AM.queueDownload("./img/sprites/cap_alien_standing.png");
    AM.queueDownload("./img/sprites/cap_soldier_standing.png");
    AM.queueDownload("./img/sprites/cap_soldier_animated.png");


    //Building Entities
    AM.queueDownload("./img/sprites/barracks_blue.png");
    AM.queueDownload("./img/sprites/farm_blue.png");
    AM.queueDownload("./img/sprites/barracks_red.png");
    AM.queueDownload("./img/sprites/farm_red.png");

    // Map Entities
    AM.queueDownload("./img/map/game map9072.png");
    AM.queueDownload("./map images/master.png");
    AM.queueDownload("./img/background3.png");


    // Welcome Screen
    AM.queueDownload("./img/welcome_screen.png");
    AM.queueDownload("./img/button_new-game.png");

    // Control Display
    AM.queueDownload("./img/control/button.png");
    AM.queueDownload("./img/control/action_on.png");
    AM.queueDownload("./img/control/action_off.png");
    AM.queueDownload("./img/control/build_on.png");
    AM.queueDownload("./img/control/build_off.png");
    AM.queueDownload("./img/control/build_troop_on.png");
    AM.queueDownload("./img/control/build_troop_off.png");
    AM.queueDownload("./img/control/end_turn_on.png");
    AM.queueDownload("./img/control/end_turn_off.png");
    AM.queueDownload("./img/control/barracks_on.png");
    AM.queueDownload("./img/control/fight.png");
    AM.queueDownload("./img/control/silo.png");
    AM.queueDownload("./img/control/silo2.png");
    AM.queueDownload("./img/control/move.png");
    AM.queueDownload("./img/control/soldier5.png");



    AM.downloadAll(function () {
        gameEngine.addEntity(new WelcomeScreen(gameEngine));
    });



    // regionArray = BuildRegions();
    // BuildBoard();
    // StartGame(regionArray);



    // console.log('This is a test');
    // fight(regionArray[12], regionArray[0]) ? console.log('you win') : console.log('you lose');
}

Main();
// ===================================================================
// End - Main
// ==================================================================