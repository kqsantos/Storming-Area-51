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
console.log(Object.keys(regionsList).length);

// for (var i = 0; i < regionsList.length; i++) {
//     if (regionsList[i] != undefined)
//         console.log(regionsList[i].barracksXY[0]);
// }

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

var selectedRegion = null;
var currentPlayerTurn = 0;
var turnCount = 1;
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

function Player(ID) {
    this.ID = ID;
    this.foodCount = 0,
    this.upgradeLevel = 0;
}
// ===================================================================
// End - Map Entities
// ===================================================================



// ===================================================================
// Start - Utility Functions
// ===================================================================\

function toggleTurn() {
    currentPlayerTurn = currentPlayerTurn % 2;
    turnCount++;
}

function addCaptainToRegion(region) {
    var newCap;
    if (region.owner == 0) {
        newCap = new SoldierCaptain(gameEngine, region.capXY[0], region.capXY[1]);
    } else {
        newCap = new AlienCaptain(gameEngine, region.capXY[0], region.capXY[1]);
    }
    region.cap = newCap;
    gameEngine.addEntity(region.cap);
}

function removeCaptainFromRegion(region) {
    if (region.cap != null) {
        region.cap.removeFromWorld = true;
        region.cap = null;
    }
}

function buildFarm(region) {
    var newFarm;
    if (region.owner == 0) {
        newFarm = new Farm(gameEngine, 0, region.farmXY[0], region.farmXY[1]);
    } else {
        newFarm = new Farm(gameEngine, 1, region.farmXY[0], region.farmXY[1]);
    }
    region.bldg["farm"] = newFarm;
    gameEngine.addEntity(newFarm);
}

function buildBarracks(region) {
    var newBarracks;
    if (region.owner == 0) {
        newBarracks = new Barracks(gameEngine, 0, region.barracksXY[0], region.barracksXY[1]);
    } else {
        newBarracks = new Barracks(gameEngine, 1, region.barracksXY[0], region.barracksXY[1]);
    }
    region.bldg["barracks"] = newBarracks;
    gameEngine.addEntity(newBarracks);
}

function buildSoldier(region) {
    var newTroop;

    if (region.troop["soldier"] != null) {
        region.troop["soldier"].count++;
    }
    else if (region.owner == 0) {
        newTroop = new Soldier(gameEngine, region.troopXY[0], region.troopXY[1]);
        region.troop["soldier"] = newTroop;
        gameEngine.addEntity(region.troop["soldier"]);
    }
    else {
        newTroop = new Alien(gameEngine, region.troopXY[0], region.troopXY[1]);
        region.troop["soldier"] = newTroop;
        gameEngine.addEntity(region.troop["soldier"]);
    }
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
    var arrWidth = (gameEngine.surfaceWidth / dim).toFixed(0);
    var arrHeigth = (gameEngine.surfaceHeight / dim).toFixed(0);

    for (var i = 0; i < arrWidth; i++) {
        onScreenRegions[i] = new Array(arrHeigth);
        console.log("width of onScreenArray --- " + arrWidth);
    }

    // update the value of the array
    for (var i = 0; i < arrWidth; i++) {
        for (var j = 0; j < gameEngine.surfaceHeight / dim; j++) {
            let xCor = origin.x + i;
            let yCor = origin.y + j;

            if (gameBoard[xCor][yCor] != undefined) {
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
    var tempRegion = null;
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
                tempRegion = rects[i][j];
            }

        }
    }

    if (regionsList[tempRegion.name] != null) {

        if (selectedRegion != null) setSpritesToUnselected(selectedRegion);
        selectedRegion = regionsList[tempRegion.name];
        setSpritesToSelected(selectedRegion);


    } else {
        if (selectedRegion != null) setSpritesToUnselected(selectedRegion);
        selectedRegion = null;
    }

}

function setSpritesToUnselected(region) {

    if (region.troop["soldier"] != null) {
        region.troop["soldier"].selected = false;
    }

    if (region.cap != null) {
        region.cap.selected = false;
    }
}

function setSpritesToSelected(region) {

    if (region.troop["soldier"] != null) {
        region.troop["soldier"].selected = true;
    }
    if (region.cap != null) {
        region.cap.selected = true;
    }

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
    regionsList[10] = new Region(10, 0, [1025, 568], [949, 745], [1121, 665], null, [963, 604], 'plains', [11, 12, 46, 47]);
    regionsList[11] = new Region(11, 0, [1040, 990], [1100, 1050], [1225, 997], null, [1125, 904], 'plains', [10, 12, 50, 60]);
    regionsList[12] = new Region(12, 0, [750, 800], [752, 1044], [810, 898], null, [842, 920], 'plains', [10, 11, 13, 18, 36]);
    regionsList[13] = new Region(13, 0, [479, 1013], [481, 1090], [509, 951], null, [643, 1053], 'plains', [12, 14, 36]);
    regionsList[14] = new Region(14, 0, [189, 811], [199, 991], [233, 913], null, [291, 997], 'plains', [13, 36, 35, 19]);
    regionsList[15] = new Region(15, 0, [145, 260], [230, 180], [480, 241], null, [384, 217], 'plains', [16, 17]);
    regionsList[16] = new Region(16, 0, [442, 329], [446, 403], [310, 400], null, [220, 371], 'plains', [15, 17, 18, 19]);
    regionsList[17] = new Region(17, 0, [575, 163], [575, 255], [620, 399], null, [706, 229], 'plains', [15, 16, 18, 45, 46]);
    regionsList[18] = new Region(18, 0, [675, 490], [695, 555], [590, 510], null, [585, 575], 'plains', [12, 19, 16, 17, 46]);
    regionsList[19] = new Region(19, 0, [290, 633], [215, 705], [138, 635], null, [210, 603], 'plains', [16, 18, 14]);

    regionsList[40] = new Region(40, 0, [1759, 731], [1773, 845], [1635, 1109], null, [1721, 1139], 'tundra', [60, 61, 41, 50, 42, 44]);
    regionsList[41] = new Region(41, 0, [1957, 881], [2083, 1061], [2117, 767], null, [2033, 771], 'tundra', [42, 40, 61]);
    regionsList[42] = new Region(42, 0, [2073, 653], [2161, 653], [2015, 655], null, [1907, 649], 'tundra', [41, 40, 44, 43]);
    regionsList[43] = new Region(43, 0, [2051, 491], [2049, 389], [2141, 223], null, [2065, 273], 'tundra', [42, 49]);
    regionsList[44] = new Region(44, 0, [1675, 607], [1773, 617], [1685, 523], null, [1781, 515], 'tundra', [42, 40, 50, 48, 49]);
    regionsList[45] = new Region(45, 0, [1011, 99], [1071, 170], [953, 177], null, [831, 145], 'tundra', [17, 46, 47]);
    regionsList[46] = new Region(46, 0, [835, 435], [989, 429], [1017, 339], null, [849, 313], 'tundra', [17, 18, 10, 47, 45]);
    regionsList[47] = new Region(47, 0, [1221, 99], [1307, 395], [1281, 201], null, [1229, 311], 'tundra', [45, 46, 10, 48, 50]);
    regionsList[48] = new Region(48, 0, [1445, 345], [1443, 549], [1565, 289], null, [1549, 597], 'tundra', [47, 50, 44, 49]);
    regionsList[49] = new Region(49, 0, [1831, 101], [1903, 301], [1823, 201], null, [1761, 291], 'tundra', [48, 44, 43]);
    regionsList[50] = new Region(50, 0, [1375, 819], [1371, 969], [1559, 765], null, [1649, 767], 'tundra', [10, 11, 60, 40, 44, 48, 47]);

    regionsList[29] = new Region(29, 1, [707, 1965], [703, 2051], [855, 2059], null, [899, 1971], 'sand', [30, 32, 39, 67]);
    regionsList[30] = new Region(30, 1, [557, 2033], [553, 2115], [475, 2137], null, [447, 2027], 'sand', [29, 31, 32]);
    regionsList[31] = new Region(31, 1, [137, 2025], [277, 2027], [255, 2177], null, [247, 2095], 'sand', [30, 32, 33]);
    regionsList[32] = new Region(32, 1, [363, 1917], [261, 1847], [569, 1855], null, [487, 1907], 'sand', [29, 30, 31, 33, 38]);
    regionsList[33] = new Region(33, 1, [135, 1783], [137, 1715], [183, 1587], null, [147, 1901], 'sand', [31, 32, 38, 35]);
    regionsList[34] = new Region(34, 1, [900, 1332], [884, 1532], [1089, 1427], null, [996, 1408], 'sand', [65, 60, , 39, 37]);
    regionsList[35] = new Region(35, 1, [184, 1238], [276, 1432], [366, 1336], null, [270, 1324], 'sand', [14, 36, 37, 38, 33]);
    regionsList[36] = new Region(36, 1, [466, 1252], [566, 1186], [672, 1184], null, [770, 1188], 'sand', [12, 13, 14, 35, 37, 34]);
    regionsList[37] = new Region(37, 1, [554, 1432], [548, 1360], [702, 1362], null, [770, 1356], 'sand', [34, 36, 35, 38]);
    regionsList[38] = new Region(38, 1, [542, 1550], [572, 1716], [490, 1642], null, [384, 1628], 'sand', [39, 32, 33, 35, 37]);
    regionsList[39] = new Region(39, 1, [822, 1670], [824, 1752], [1024, 1752], null, [978, 1828], 'sand', [34, 38, 29, 65]);

    regionsList[60] = new Region(60, 1, [1368, 1328], [1464, 1326], [1512, 1170], null, [1326, 1206], 'grassland', [40, 50, 11, 64, 65, 34]);
    regionsList[61] = new Region(61, 1, [1930, 1214], [2052, 1326], [2198, 1218], null, [2084, 1208], 'grassland', [41, 40, 62]);
    regionsList[62] = new Region(62, 1, [1838, 1587], [2012, 1559], [2118, 1515], null, [1910, 1479], 'grassland', [61, 64, 63]);
    regionsList[63] = new Region(63, 1, [1678, 1705], [1988, 1801], [1910, 1807], null, [1964, 1715], 'grassland', [62, 64, 66, 68, 69]);
    regionsList[64] = new Region(64, 1, [1494, 1463], [1590, 1543], [1706, 1517], null, [1726, 1443], 'grassland', [62, 63, 66, 65, 60]);
    regionsList[65] = new Region(65, 1, [1174, 1602], [1182, 1449], [1336, 1471], null, [1222, 1497], 'grassland', [34, 39, 66, 60, 64]);
    regionsList[66] = new Region(66, 1, [1361, 1646], [1369, 1728], [1477, 1628], null, [1487, 1708], 'grassland', [64, 65, 63, 68, 67]);
    regionsList[67] = new Region(67, 1, [1225, 1940], [1377, 1940], [1383, 2088], null, [1313, 2030], 'grassland', [66, 29]);
    regionsList[68] = new Region(68, 1, [1643, 2002], [1767, 2022], [1623, 2122], null, [1697, 2106], 'grassland', [69, 63]);
    regionsList[69] = new Region(69, 1, [2007, 2126], [2111, 2136], [2105, 2016], null, [2051, 1958], 'grassland', [63, 68]);

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

function collectFood (player) {
    var foodCount = 0;
    regionsList.forEach((region) => {
        if(player.id === region.owner) foodCount += 1;
    });
}

// ===================================================================
// End - Utility Functions
// ===================================================================

// ===================================================================
// Start - Menu Functions
// ===================================================================
function moveFight(source, destination) {
    //Rebuild
    
    if (destination.owner === source.owner || destination.troops === []) {
        while (source.troops.length() > 0) destination.troops.push(source.troops.pop()); // Pushes troops from one destination to the next.
    } else {

        var atkPow = 0;
        source.troops.forEach((troop) => atkPow += troop.count*troop.atk);

        var defPow = 0;
        source.troops.forEach((troop) => defPow += troop.count*troop.def);

        while (defPow > 0 && atkPow > 0) {
            if (Math.random() > 0.5) {
                atkPow--
            } else {
                defPow--;
            }
        }

        if (atkPow > defPow) {
            destination.owner = source.owner;
            destination.troops = source.troops;
            source.troops = [];
            return true; // Attacker won
        } else {
            destination.troops = [];
            return false; // Defender won
        }
    }
}

function moveCap(source, destination) {
    if (destination.owner === source.owner) {
        source.cap = destination.cap;
        source.cap = null;
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
    GUIEntity.call(this, game, gameEngine.surfaceWidth - 380, 0);
}

ResourceDisplay.prototype = new GUIEntity();
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
        for (var i = 0; i < onScreenRegions.length; i++) {
            for (var j = 0; j < onScreenRegions[i].length; j++) {
                // add sahdows to numbers
                ctx.fillStyle = "black";
                ctx.font = "10px Arial";
                ctx.fillText(onScreenRegions[i][j].name, (i * dim) + xCal + 2, ((j + 1) * dim) + yCal + 2);

                //displays numbers
                ctx.fillStyle = "white";
                ctx.font = "10px Arial";
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

    GUIEntity.call(this, game, 0, 0);
}

MinimapDisplay.prototype = new GUIEntity();
MinimapDisplay.prototype.constructor = MinimapDisplay;

MinimapDisplay.prototype.update = function (ctx) {
    var click = gameEngine.click;
    if (click != null &&
        click.x >= this.originX &&
        click.y >= this.originY &&
        click.x <= this.smWidth &&
        click.y <= this.smHeight) {
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

        changeCameraOrigin(Number(xTranslationToMap), Number(yTranslationToMap));
        createArray(cameraOrigin);
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
    this.fightIconOn = AM.getAsset("./img/control/fight_on.png")
    this.fightIconOff = AM.getAsset("./img/control/fight_off.png")
    this.moveIcon = AM.getAsset("./img/control/move.png")
    this.kingIconOn = AM.getAsset("./img/control/king_on.png")
    this.kingIconOff = AM.getAsset("./img/control/king_off.png")

    this.buildIconOn = AM.getAsset("./img/control/build_on.png")
    this.buildIconOff = AM.getAsset("./img/control/build_off.png")
    this.barracksIconOn = AM.getAsset("./img/control/barracks_on.png")
    this.barracksIconOff = AM.getAsset("./img/control/barracks_off.png")
    this.siloIconOn = AM.getAsset("./img/control/silo_on.png")
    this.siloIconOff = AM.getAsset("./img/control/silo_off.png")

    this.troopIconOn = AM.getAsset("./img/control/knight_on.png")
    this.troopIconOff = AM.getAsset("./img/control/knight_off.png")
    this.soldierIconOn = AM.getAsset("./img/control/troop_on.png")
    this.soldierIconOff = AM.getAsset("./img/control/troop_off.png")

    this.endTurnIconOn = AM.getAsset("./img/control/end_turn_on.png")
    this.endTurnIconOff = AM.getAsset("./img/control/end_turn_off.png")

    this.updateFlag = false;

    var w = gameEngine.surfaceWidth;
    var h = gameEngine.surfaceHeight;
    this.aBtn = { x: w - this.btnDim * 4, y: h - this.btnDim };
    this.tBtn = { x: w - this.btnDim * 3, y: h - this.btnDim };
    this.bBtn = { x: w - this.btnDim * 2, y: h - this.btnDim };
    this.eTBtn = { x: w - this.btnDim * 1, y: h - this.btnDim };

    this.a_moveBtn = { x: w - this.btnDim * 4, y: h - this.btnDim * 2 };
    this.a_capBtn = { x: w - this.btnDim * 5, y: h - this.btnDim * 2 };
    this.t_infBtn = { x: w - this.btnDim * 3, y: h - this.btnDim * 2 };
    this.b_farmBtn = { x: w - this.btnDim * 2, y: h - this.btnDim * 2 };
    this.b_barBtn = { x: w - this.btnDim * 3, y: h - this.btnDim * 2 };


    this.menu = [{ name: "action", x: this.aBtn.x, y: this.aBtn.y, w: this.btnDim, h: this.btnDim },
    { name: "troop", x: this.tBtn.x, y: this.tBtn.y, w: this.btnDim, h: this.btnDim },
    { name: "building", x: this.bBtn.x, y: this.bBtn.y, w: this.btnDim, h: this.btnDim },
    { name: "endTurn", x: this.eTBtn.x, y: this.eTBtn.y, w: this.btnDim, h: this.btnDim }];

    this.actionMenu = [{ name: "moveCap", x: this.a_capBtn.x, y: this.a_capBtn.y, w: this.btnDim, h: this.btnDim },
    { name: "moveFight", x: this.a_moveBtn.x, y: this.a_moveBtn.y, w: this.btnDim, h: this.btnDim }];

    this.troopMenu = [{ name: "troop1", x: this.t_infBtn.x, y: this.t_infBtn.y, w: this.btnDim, h: this.btnDim }];

    this.buildingMenu = [{ name: "farm", x: this.b_farmBtn.x, y: this.b_farmBtn.y, w: this.btnDim, h: this.btnDim },
    { name: "barracks", x: this.b_barBtn.x, y: this.b_barBtn.y, w: this.btnDim, h: this.btnDim }];

    this.moveDelay = false;
    this.currentRegion = null;
    this.moveSource = null;
    this.moveDestination = null;

    this.destinationSelect = false;
    this.destinationSelectCaptain = false;

    this.actionFlag = false; // Display action sub-menu
    this.troopFlag = false; // Display troop sub-menu
    this.buildingFlag = false; // Display building sub-menu

    // Mega Menu On/Off boolean
    this.actionActive = false;
    this.troopActive = false;
    this.buildingActive = false;
    this.endTurnActive = false;

    // Sub-menu On/Off boolean
    this.moveActive = false;
    this.capActive = false;
    this.soldierActive = false;
    this.barracksActive = false;
    this.farmActive = false;

    GUIEntity.call(this, game, 0, 0);
}

ControlDisplay.prototype = new GUIEntity();
ControlDisplay.prototype.constructor = ControlDisplay;

// max x=1438; x changes by the size of the map display
ControlDisplay.prototype.update = function (ctx) {
    var click = gameEngine.click;
    var that = this;

    // if(this.currentRegion != null){
    //     console.log("here"+this.currentRegion.id)

    // }

    // if(selectedRegion != null){
    //     console.log("select"+selectedRegion.id);
    // }

    if (selectedRegion != this.currentRegion) {
        if (selectedRegion != null) {
            toggleAllOff();
            toggleAllOffMega();
            toggleAllOnMega();
            // if(this.currentRegion != null){
            //     this.previousRegion = this.currentRegion
            //     console.log("pre " + this.previousRegion.id)
            //     console.log("current " + selectedRegion.id )
            // }


        } else {
            toggleAllOff();
            toggleAllOffMega();

            // if(this.currentRegion != null){
            //     console.log("herelse"+this.currentRegion.id)
            // }
            // if(selectedRegion != null){
            //     console.log("selectelse"+selectedRegion.id);
            // }
        }
    }
    if (selectedRegion != null) {
        this.currentRegion = selectedRegion;

    }

    // Captain flag
    if (selectedRegion != null && selectedRegion.cap != null) {
        this.captainActive = true;
    } else {
        this.captainActive = false;
    }

    if (selectedRegion != null && selectedRegion.troop != null) {
        this.moveActive = true;
    } else {
        this.moveActive = false;
    }

    // Soldier flag
    if (selectedRegion != null && selectedRegion.bldg["barracks"] == null) {
        this.soldierActive = false;
    } else {
        this.soldierActive = true;
    }

    // Barracks flag
    if (selectedRegion != null && selectedRegion.bldg["barracks"] != null) {
        this.barracksActive = false
    } else {
        this.barracksActive = true;
    }

    // Farm flag
    if (selectedRegion != null && selectedRegion.bldg["farm"] != null) {
        this.farmActive = false
    } else {
        this.farmActive = true;
    }


    // if (click != null &&
    //     ((click.x >= this.aBtn.x &&
    //         click.y <= this.aBtn.y) ||
    //     (click.x <= this.aBtn.x &&
    //             click.y <= this.aBtn.y) ||
    //     (click.x <= this.aBtn.x &&
    //             click.y >= this.aBtn.y)) &&
    //     click.x <= gameEngine.surfaceWidth &&
    //     click.y <= gameEngine.surfaceHeight) { 

    if (this.destinationSelect && this.moveDelay) {
        this.moveDestination = selectedRegion;
        this.destinationSelect = false;
        this.moveDelay = false;
        console.log("source " + this.moveSource.id)
        console.log("des " + this.moveDestination.id)
        // Ryan's function goes here

    }

    if (click != null && this.destinationSelectCaptain) {
        this.moveDestination = selectedRegion;
        // Ryan's function goes here

    }


    // Sub-menu for Action Button
    if (click != null && this.actionFlag == true &&
        click.x >= this.a_capBtn.x &&
        click.y >= this.a_capBtn.y &&
        click.x <= (this.a_moveBtn.x + this.btnDim) &&
        click.y <= (this.a_moveBtn.y + this.btnDim)) {
        var actionItem = getClickedItem(this.actionMenu, click.x, click.y);
        if (actionItem != null) {
            if (this.moveActive == true && actionItem.name == "moveFight") {

                this.destinationSelect = true;
                this.moveSource = selectedRegion;
                console.log("pre click -- " + this.moveSource.id)

            }
            else if (this.capActive == true && actionItem.name == "moveCap") {


                this.destinationSelectCaptain = true;
                this.moveSource = selectedRegion;
            }
        }
        gameEngine.click = null;
    }






    // Sub-menu for Troop Button
    if (click != null && this.troopFlag == true &&
        click.x >= this.t_infBtn.x &&
        click.y >= this.t_infBtn.y &&
        click.x <= (this.t_infBtn.x + this.btnDim) &&
        click.y <= (this.t_infBtn.y + this.btnDim)) {
        var troopItem = getClickedItem(this.troopMenu, click.x, click.y);
        if (troopItem != null) {
            if (this.soldierActive == true && troopItem.name == "troop1") {
                var source = selectedRegion;
                // Ryan's function goes here
            }

        }
        gameEngine.click = null;
        toggleAllOff();
    }

    // Sub-menu for Build Button
    if (click != null && this.buildingFlag == true &&
        click.x >= this.b_barBtn.x &&
        click.y >= this.b_barBtn.y &&
        click.x <= (this.b_farmBtn.x + this.btnDim) &&
        click.y <= (this.b_farmBtn.y + this.btnDim)) {
        var buildingItem = getClickedItem(this.buildingMenu, click.x, click.y);
        if (buildingItem != null) {
            if (this.farmActive == true && buildingItem.name == "farm") {
                var source = selectedRegion;
                // Ryan's function goes here


            } else if (this.barracksActive == true && buildingItem.name == "barracks") {
                var source = selectedRegion;
                // Ryan's function goes here

            }

        }
        gameEngine.click = null;
        toggleAllOff();
    }


    // End turn button
    if (click != null &&
        click.x >= this.eTBtn.x &&
        click.y >= this.eTBtn.y &&
        click.x <= (this.eTBtn.x + this.btnDim) &&
        click.y <= (this.eTBtn.y + this.btnDim)) {
        var endItem = getClickedItem(this.menu, click.x, click.y);
        if (endItem != null) {
            if (this.endTurnActive == true && endItem.name == "endTurn") {
                // Ryan's function goes here





            }

        }
        gameEngine.click = null;
        toggleAllOff();
    }



    if (click != null &&
        click.x >= this.aBtn.x &&
        click.y >= this.aBtn.y &&
        click.x <= gameEngine.surfaceWidth &&
        click.y <= gameEngine.surfaceHeight) {

        var item = getClickedItem(this.menu, click.x, click.y);

        if (selectedRegion != null) {

            if (item !== null) {
                if (this.actionActive && item.name === "action") {
                    toggleAllOff();
                    this.actionFlag = true;
                    click = null;
                }
                if (this.troopActive && item.name === "troop") {
                    toggleAllOff();
                    this.troopFlag = true;
                    click = null;
                }
                if (this.buildingActive && item.name === "building") {
                    toggleAllOff();
                    this.buildingFlag = true;
                    click = null;
                }
                if (this.endTurnActive && item.name === "endTurn") {
                    toggleAllOff();
                }
            } else {
                toggleAllOff();
            }



            // enable/disable based on number of buildings
            // if (selectedRegion.bldg.length === 2) {
            //     //this.troopActive = false;
            //     this.barracksFlag = false;
            //     this.siloFlag = false
            // } else if (selectedRegion.bldg.length === 1) {
            //     if (selectedRegion.bldg[0] === "Farm") {
            //         this.siloFlag = false;
            //     } else {
            //         this.barracksFlag = false;
            //     }
            // }

            // // enable/disable the move of captain depends on canpatin present


        } else {

        }

        gameEngine.click = null;
    }

    function toggleAllOff() {
        that.actionFlag = false;
        that.troopFlag = false;
        that.buildingFlag = false;
    }

    function toggleAllOnMega() {
        that.actionActive = true;
        that.troopActive = true;
        that.buildingActive = true;
        that.endTurnActive = true;
    }

    function toggleAllOffMega() {
        that.actionActive = false;
        that.troopActive = false;
        that.buildingActive = false;

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

    // Mega menu On/Off draw
    if (this.actionActive) {
        ctx.drawImage(this.actionIconOn, this.aBtn.x + 10, this.aBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
    } else {
        ctx.drawImage(this.actionIconOff, this.aBtn.x + 10, this.aBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
    }

    if (this.buildingActive) {
        ctx.drawImage(this.buildIconOn, this.bBtn.x + 10, this.bBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
    } else {
        ctx.drawImage(this.buildIconOff, this.bBtn.x + 10, this.bBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
    }

    if (this.troopActive) {
        ctx.drawImage(this.troopIconOn, this.tBtn.x + 10, this.tBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
    } else {
        ctx.drawImage(this.troopIconOff, this.tBtn.x + 10, this.tBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
    }
    ctx.drawImage(this.endTurnIconOn, this.eTBtn.x + 10, this.eTBtn.y + 10, this.btnDim - 20, this.btnDim - 20);


    if (this.actionFlag) {
        if (this.captainActive) {
            ctx.drawImage(this.buttonIcon, this.a_capBtn.x, this.a_capBtn.y, this.btnDim, this.btnDim);
            ctx.drawImage(this.kingIconOn, this.a_capBtn.x + 10, this.a_capBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        } else {
            ctx.drawImage(this.buttonIcon, this.a_capBtn.x, this.a_capBtn.y, this.btnDim, this.btnDim);
            ctx.drawImage(this.kingIconOff, this.a_capBtn.x + 10, this.a_capBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        }
        if (this.moveActive) {
            ctx.drawImage(this.buttonIcon, this.a_moveBtn.x, this.a_moveBtn.y, this.btnDim, this.btnDim);
            ctx.drawImage(this.fightIconOn, this.a_moveBtn.x + 10, this.a_moveBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        } else {
            ctx.drawImage(this.buttonIcon, this.a_moveBtn.x, this.a_moveBtn.y, this.btnDim, this.btnDim);
            ctx.drawImage(this.fightIconOff, this.a_moveBtn.x + 10, this.a_moveBtn.y + 10, this.btnDim - 20, this.btnDim - 20);

        }


        // if (debug) {
        //     console.log("ac" + this.actionFlag);
        //     console.log("tr" + this.troopFlag);
        //     console.log("bu" + this.buildingFlag);
        // }
    }


    if (this.troopFlag) {

        if (this.soldierActive) {
            ctx.drawImage(this.buttonIcon, this.t_infBtn.x, this.t_infBtn.y, this.btnDim, this.btnDim);
            ctx.drawImage(this.soldierIconOn, this.t_infBtn.x + 10, this.t_infBtn.y + 10, this.btnDim - 20, this.btnDim - 20);

        } else {
            ctx.drawImage(this.buttonIcon, this.t_infBtn.x, this.t_infBtn.y, this.btnDim, this.btnDim);
            ctx.drawImage(this.soldierIconOff, this.t_infBtn.x + 10, this.t_infBtn.y + 10, this.btnDim - 20, this.btnDim - 20);

        }

        // if (debug) {
        //     console.log("ac" + this.actionFlag);
        //     console.log("tr" + this.troopFlag);
        //     console.log("bu" + this.buildingFlag);
        // }
    }


    if (this.buildingFlag) {
        // Barracks On/Off
        if (this.barracksActive) {
            ctx.drawImage(this.buttonIcon, this.b_barBtn.x, this.b_barBtn.y, this.btnDim, this.btnDim);
            ctx.drawImage(this.barracksIconOn, this.b_barBtn.x + 10, this.b_barBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        } else {
            ctx.drawImage(this.buttonIcon, this.b_barBtn.x, this.b_barBtn.y, this.btnDim, this.btnDim);
            ctx.drawImage(this.barracksIconOff, this.b_barBtn.x + 10, this.b_barBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        }

        // Farm On/Off
        if (this.farmActive) {
            ctx.drawImage(this.buttonIcon, this.b_farmBtn.x, this.b_farmBtn.y, this.btnDim, this.btnDim);
            ctx.drawImage(this.siloIconOn, this.b_farmBtn.x + 10, this.b_farmBtn.y + 10, this.btnDim - 20, this.btnDim - 20);
        } else {
            ctx.drawImage(this.buttonIcon, this.b_farmBtn.x, this.b_farmBtn.y, this.btnDim, this.btnDim);
            ctx.drawImage(this.siloIconOff, this.b_farmBtn.x + 10, this.b_farmBtn.y + 10, this.btnDim - 20, this.btnDim - 20);

        }
        // if (debug) {
        //     console.log("ac" + this.actionFlag);
        //     console.log("tr" + this.troopFlag);
        //     console.log("bu" + this.buildingFlag);
        // }
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
                changeCameraOrigin(Number(cameraOrigin.x), Number(cameraOrigin.y) - Number(this.sensitivity));

                if (debug) {
                    console.log("%c RegionArray below this:", "background: #222; color: #bada55");
                    console.log(onScreenRegions);
                }
            } else {
                changeCameraOrigin(Number(cameraOrigin.x), 0);
            }
            createArray(cameraOrigin);
        }
        else if (key["code"] === "KeyA") {
            if (Number(cameraOrigin.x) - Number(this.sensitivity) > 0) {
                changeCameraOrigin(Number(cameraOrigin.x) - Number(this.sensitivity), Number(cameraOrigin.y));


                if (debug) {
                    console.log("%c RegionArray below this:", "background: #222; color: #bada55");
                    console.log(onScreenRegions);
                }
            } else {
                changeCameraOrigin(0, Number(cameraOrigin.y));
            }
            createArray(cameraOrigin);
        }
        else if (key["code"] === "KeyS") {
            if (Number(cameraOrigin.y) + Number(this.sensitivity) < this.keyYMax) {
                changeCameraOrigin(Number(cameraOrigin.x), Number(cameraOrigin.y) + Number(this.sensitivity));

                if (debug) {
                    console.log("%c RegionArray below this:", "background: #222; color: #bada55");
                    console.log(onScreenRegions);
                }
            } else {
                changeCameraOrigin(Number(cameraOrigin.x), Number(this.keyYMax));
            }
            createArray(cameraOrigin);

        }
        else if (key["code"] === "KeyD") {
            if (Number(cameraOrigin.x) + Number(this.sensitivity) < Number(this.keyXMax)) {
                changeCameraOrigin(Number(cameraOrigin.x) + Number(this.sensitivity), Number(cameraOrigin.y));

                if (debug) {
                    console.log("%c RegionArray below this:", "background: #222; color: #bada55");
                    console.log(onScreenRegions);
                }

            } else {
                changeCameraOrigin(Number(this.keyXMax), Number(cameraOrigin.y));
            }
            createArray(cameraOrigin);
        }
        console.log(key["code"])
        console.log(cameraOrigin);
        gameEngine.keyDown = null;

    }



    // Control clicks on the map
    var click = gameEngine.click;
    if (click != null) {

        getClickedRegion(onScreenRegions, click.x, click.y);
        console.log(gameEngine.GUIEntities[2].moveDelay)
        console.log(gameEngine.GUIEntities[2].destinationSelect)
        
        if(gameEngine.GUIEntities[2].destinationSelect) {
            
            gameEngine.GUIEntities[2].moveDelay = true;
            console.log("movedelay after moveDelay set " + gameEngine.GUIEntities[2].moveDelay)
        }



        console.log("%c Region clicked below this:", "background: #222; color: #bada55");
        console.log(click);
        console.log(selectedRegion);
        console.log("True Location --- " + (Number(dim * cameraOrigin.x) + Number(click.x)) + ", " +
            (Number(dim * cameraOrigin.y) + Number(click.y)));
        var text = "[" + (Number(dim * cameraOrigin.x) + Number(click.x)) + ", " +
            (Number(dim * cameraOrigin.y) + Number(click.y)) + "]";
        navigator.clipboard.writeText(text).then(function () {
            console.log('Async: Copying to clipboard was successful!');
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });


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
// Start - Welcome Screen
// ===================================================================

function WelcomeScreen(game) {
    // Welcome Screen Background
    this.animation = new Animation(AM.getAsset("./img/welcome_screen.png"), 1280, 720, 7680, .08, 6, true, 1);
    this.background = AM.getAsset("./img/welcome_background.png");
    this.hover = AM.getAsset("./img/welcome_hover2.png");

    this.display = this.background;
    this.ctx = game.ctx;

    // New Game Button Paramters
    this.newGameButton = AM.getAsset("./img/button_new-game.png");
    this.ngbWidth = 270;
    this.ngbHeight = 72;
    this.ngbX = (gameEngine.surfaceWidth / 2) - (270 / 2); //This is to center the button
    this.ngbY = 500; //Y-coordinate of button

    // Hitboxes for the buttons
    this.hitBoxes = [{ name: "newGame", x: 591, y: 388, w: 567, h: 165 }];

    this.audio = new Audio("./sound/welcome_music.mp3");
    this.audio.autoplay = true;
    this.audio.play();

    Entity.call(this, game, 0, 0);
}

WelcomeScreen.prototype = new Entity();
WelcomeScreen.prototype.constructor = WelcomeScreen;

WelcomeScreen.prototype.update = function (ctx) {


    if (gameEngine.mouseOver != null) {
        var temp = getClickedItem(this.hitBoxes, gameEngine.mouseOver.layerX, gameEngine.mouseOver.layerY);
        console.log(temp);
        if (temp != null && temp.name === "newGame") {
            this.display = this.hover;
        } else {
            this.display = this.background;
        }
        gameEngine.mouseOver = null;
    }

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
        gameEngine.addGUIEntity(new MinimapDisplay(gameEngine));
        gameEngine.addGUIEntity(new ResourceDisplay(gameEngine));
        gameEngine.addGUIEntity(new ControlDisplay(gameEngine));

        gameEngine.addEntity(new InputHandler(gameEngine));
        gameEngine.addEntity(new AudioHandler(gameEngine));

        // Starting conditions
        for (var i = 0; i < regionsList.length; i++) {
            if (regionsList[i] != undefined) {
                buildFarm(regionsList[i]);
                buildBarracks(regionsList[i]);
            }
        }


        for (var i = 0; i < regionsList.length; i++) {
            if (regionsList[i] != undefined) {
                if ((i >= 40 && i <= 50) || (i >= 29 && i <= 39))
                    buildSoldier(regionsList[i]);
            }
        }

        addCaptainToRegion(regionsList[43]);
        addCaptainToRegion(regionsList[31]);

        // gameEngine.addEntity(new Alien(gameEngine, 300, 250));

    }
}

WelcomeScreen.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    ctx.drawImage(this.newGameButton, this.ngbX, this.ngbY, this.ngbWidth, this.ngbHeight);
    ctx.drawImage(this.display, 0, 0);
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

    AM.queueDownload("./img/welcome_background.png");
    AM.queueDownload("./img/welcome_hover.png");
    AM.queueDownload("./img/welcome_hover2.png");

    // Control Display
    AM.queueDownload("./img/control/button.png");
    AM.queueDownload("./img/control/action_on.png");
    AM.queueDownload("./img/control/action_off.png");
    AM.queueDownload("./img/control/build_on.png");
    AM.queueDownload("./img/control/build_off.png");
    AM.queueDownload("./img/control/knight_on.png");
    AM.queueDownload("./img/control/knight_off.png");
    AM.queueDownload("./img/control/end_turn_on.png");
    AM.queueDownload("./img/control/end_turn_off.png");
    AM.queueDownload("./img/control/barracks_on.png");
    AM.queueDownload("./img/control/barracks_off.png");
    AM.queueDownload("./img/control/fight_on.png");
    AM.queueDownload("./img/control/fight_off.png");
    AM.queueDownload("./img/control/silo_on.png");
    AM.queueDownload("./img/control/silo_off.png");
    AM.queueDownload("./img/control/move.png");
    AM.queueDownload("./img/control/troop_on.png");
    AM.queueDownload("./img/control/troop_off.png");
    AM.queueDownload("./img/control/king_on.png");
    AM.queueDownload("./img/control/king_off.png");



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
// ===================================================================