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

var displayEnd = false;


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
var visibleRegions = [];
createArray(cameraOrigin);
console.log("%c onScreenRegions below this:", "background: #222; color: #bada55");
console.log(onScreenRegions);

var bgWidth = 2340;
var bgHeight = 2340;

var modbgWidth = bgWidth;
var modbgHeight = bgHeight;

var debug = false;
var debugGrid = false;
var toggleFogOfWar = true;

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
        else {
            ctx.drawImage(this.spriteSheet, 1122, 0, 187, 128, (gameEngine.surfaceWidth / 2) - (187 / 2), 180, 187, 128);
        }
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
    this.name = name;
    this.atk = atk;
    this.def = def;
    this.cost = cost;
    this.move = move;
}

/**
 * Creates a building in the game.
 * 
 * @param {String} name name of the building (name must be unique)
 * @param {int} cost cost value of the building
 */
function Building(name, cost) {
    this.name = name;
    this.cost = cos;
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
function Region(id, owner, barracksXY, farmXY, troopXY, cap, capXY, territory, neighbors, outline, rangedXY, flagXY) {
    this.id = id;
    this.owner = owner;
    this.bldg = [];
    this.barracksXY = barracksXY;
    this.farmXY = farmXY;
    this.troop = [];
    this.troopXY = troopXY;
    this.captain = cap;
    this.capXY = capXY;
    this.territory = territory;
    this.neighbors = neighbors;
    this.outline = outline;
    this.rangedXY = rangedXY;
    this.flagXY = flagXY;
    this.flag = [];
}

function Player(ID, type, cameraXY) {
    this.ID = ID;
    this.foodCount = 0;
    this.goldCount = 0;
    this.upgradeLevel = 0;
    this.type = type;
    this.cameraCoord = cameraXY;
}
// ===================================================================
// End - Map Entities
// ===================================================================



// ===================================================================
// Start - Utility Functions
// ===================================================================\

function deleteEverything(str) {
    var entitiesCount = gameEngine.entities.length;
    var GUIentitiesCount = gameEngine.GUIEntities.length;


    for (var i = 0; i < GUIentitiesCount; i++) {
        gameEngine.GUIEntities[i].removeFromWorld = true;
    }

    for (var i = 1; i < entitiesCount; i++) {
        gameEngine.entities[i].removeFromWorld = true;
    }

    gameEngine.entities[0].endGame = str;
}

function toggleTurn() {
    players[currentPlayerTurn].cameraCoord = { x: cameraOrigin.x, y: cameraOrigin.y }

    for (var i = 0; i < regionsList.length; i++) {

        if (regionsList[i] != null && regionsList[i].owner == currentPlayerTurn) {
            players[currentPlayerTurn].goldCount += 1;
        }
        if (regionsList[i] != null && regionsList[i].owner == currentPlayerTurn && regionsList[i].bldg["farm"] != null) {
            players[currentPlayerTurn].foodCount += 1;
        }

        if (regionsList[i] != null && regionsList[i].troop["soldier"] != null) {
            regionsList[i].troop["soldier"].hasMoved = 0;
        }

        if (regionsList[i] != null && regionsList[i].troop["soldierRanged"] != null) {
            regionsList[i].troop["soldierRanged"].hasMoved = 0;
        }

        if (regionsList[i] != null && regionsList[i].cap != null) {
            regionsList[i].cap.hasMoved = false;

        }


    }

    currentPlayerTurn = turnCount % 2;
    turnCount++;

    console.log("GOING TO " + players[currentPlayerTurn].cameraCoord.x + " " + players[currentPlayerTurn].cameraCoord.y)
    changeCameraOrigin(players[currentPlayerTurn].cameraCoord.x, players[currentPlayerTurn].cameraCoord.y);
    createArray(cameraOrigin);

    if (currentPlayerTurn = 1) {
        DefenceAiTurn(players[1], regionsList);
    }
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

function buildFarm(region) {
    var newFarm;
    region.owner === 0 ? newFarm = new Farm(gameEngine, 0, region.farmXY[0], region.farmXY[1]) : newFarm = new Farm(gameEngine, 1, region.farmXY[0], region.farmXY[1]);
    region.bldg["farm"] = newFarm;
    gameEngine.addEntity(newFarm);

    players[currentPlayerTurn].goldCount -= new Farm(gameEngine, 0, 0, 0).cost;
}

function buildBarracks(region) {
    var newBarracks;
    region.owner == 0 ? newBarracks = new Barracks(gameEngine, 0, region.barracksXY[0], region.barracksXY[1]) : newBarracks = new Barracks(gameEngine, 1, region.barracksXY[0], region.barracksXY[1]);
    region.bldg["barracks"] = newBarracks;
    gameEngine.addEntity(newBarracks);

    players[currentPlayerTurn].goldCount -= new Barracks(gameEngine, 0, 0, 0).cost;
}

function buildSoldier(region) {
    var newTroop;

    if (region.troop["soldier"] != null) {
        region.troop["soldier"].count++;
        region.troop["soldier"].hasMoved++;
    }
    else if (region.owner == 0) {
        newTroop = new Soldier(gameEngine, region.troopXY[0], region.troopXY[1]);
        newTroop.hasMoved = 1;
        region.troop["soldier"] = newTroop;
        gameEngine.addEntity(region.troop["soldier"]);
    }
    else {
        newTroop = new Alien(gameEngine, region.troopXY[0], region.troopXY[1]);
        newTroop.hasMoved = 1;
        region.troop["soldier"] = newTroop;
        gameEngine.addEntity(region.troop["soldier"]);
    }

    players[currentPlayerTurn].foodCount -= new Soldier(gameEngine, 0, 0).cost;
}

function buildSoldierRanged(region) {
    var newTroop;

    if (region.troop["soldierRanged"] != null) {
        region.troop["soldierRanged"].count++;
        region.troop["soldierRanged"].hasMoved++;
    }
    else if (region.owner == 0) {
        newTroop = new SoldierRanged(gameEngine, region.rangedXY[0], region.rangedXY[1]);
        newTroop.hasMoved = 1;
        region.troop["soldierRanged"] = newTroop;
        gameEngine.addEntity(region.troop["soldierRanged"]);
    }
    else {
        newTroop = new AlienRanged(gameEngine, region.rangedXY[0], region.rangedXY[1]);
        newTroop.hasMoved = 1;
        region.troop["soldierRanged"] = newTroop;
        gameEngine.addEntity(region.troop["soldierRanged"]);
    }

    players[currentPlayerTurn].foodCount -= new SoldierRanged(gameEngine, 0, 0).cost;
}

function updateFlag(region) {
    var newFlag;
    // console.log("ADD FLAG");

    if (region.flag[0] != null) {
        region.flag[0].removeFromWorld = true;
        region.flag[0] = null;
    }

    if (region.owner == 0) {
        newFlag = new BlueFlag(gameEngine, region.flagXY[0], region.flagXY[1]);
        region.flag[0] = newFlag;
        gameEngine.addEntity(region.flag[0]);
    }
    else if (region.owner == 1) {

        newFlag = new RedFlag(gameEngine, region.flagXY[0], region.flagXY[1]);
        region.flag[0] = newFlag;
        gameEngine.addEntity(region.flag[0]);
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
        // console.log("width of onScreenArray --- " + arrWidth);
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

    if (gameEngine.GUIEntities[0] != null) {
        gameEngine.GUIEntities[0].displays = getFogOfWar();
        //console.log(gameEngine.GUIEntities[0].displays)
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
    // console.log(regionsList[tempRegion.name].owner == owner)
    var region = null;
    if (regionsList[tempRegion.name] != null) {
        region = regionsList[tempRegion.name];
    } else {
        region = null;
    }

    return region;
}

function setSpritesToUnselected(region) {
    if (region.troop["soldier"] != null) region.troop["soldier"].selected = false;
    if (region.troop["soldierRanged"] != null) region.troop["soldierRanged"].selected = false;
    // if (region.flag[0] != null) region.flag[0].selected = false;
    if (region.cap != null) region.cap.selected = false;
}

function setSpritesToSelected(region) {
    if (region.troop["soldier"] != null) region.troop["soldier"].selected = true;
    if (region.troop["soldierRanged"] != null) region.troop["soldierRanged"].selected = true;
    // if (region.flag[0] != null) region.flag[0].selected = true;
    if (region.cap != null) region.cap.selected = true;
}

function getClickedItem(items, x, y) {
    var output = null;
    for (var i = 0, len = items.length; i < len; i++) {

        var left = items[i].x;
        var right = items[i].x + items[i].w;
        var top = items[i].y;
        var bottom = items[i].y + items[i].h;

        if (right >= x && left <= x && bottom >= y && top <= y) output = items[i];
    }
    return output;
}



function BuildRegions() {
    regionsList[10] = new Region(10, -1, [1025, 568], [949, 745], [1121, 665], null, [963, 604], 'plains', [11, 12, 46, 47, 50], [[51, 30], [65, 30], [65, 44], [74, 44], [74, 45], [51, 45]], [1069, 703], [1058, 660]);
    regionsList[11] = new Region(11, -1, [1040, 990], [1100, 1050], [1225, 997], null, [1125, 904], 'plains', [10, 12, 50, 60], [[51, 46], [74, 46], [74, 62], [51, 62]], [1293, 1001], [1154, 991]);
    regionsList[12] = new Region(12, -1, [750, 800], [752, 1044], [810, 898], null, [842, 920], 'plains', [10, 11, 13, 18, 36], [[31, 47], [40, 47], [40, 35], [50, 35], [50, 62], [47, 62], [47, 63], [40, 63], [40, 51], [31, 51]], [753, 884], [853, 862]);
    regionsList[13] = new Region(13, -1, [479, 1013], [481, 1090], [509, 951], null, [643, 1053], 'plains', [12, 14, 36], [[25, 47], [30, 47], [30, 52], [39, 52], [39, 63], [25, 63]], [576, 961], [481, 930]);
    regionsList[14] = new Region(14, -1, [189, 811], [199, 991], [233, 913], null, [291, 997], 'plains', [13, 36, 35, 19], [[6, 43], [20, 43], [20, 46], [24, 46], [24, 63], [23, 63], [23, 66], [6, 66], [6, 57], [9, 57], [9, 46], [6, 46]], [304, 918], [194, 961]);
    regionsList[15] = new Region(15, -1, [145, 260], [230, 180], [480, 241], null, [384, 217], 'plains', [16, 17], [[6, 4], [29, 4], [29, 16], [22, 16], [22, 20], [6, 20]], [404, 240], [457, 263]);
    regionsList[16] = new Region(16, -1, [442, 329], [446, 403], [310, 400], null, [220, 371], 'plains', [15, 17, 18, 19], [[6, 21], [23, 21], [23, 17], [29, 17], [29, 25], [6, 25]], [368, 400], [260, 432]);
    regionsList[17] = new Region(17, -1, [575, 163], [575, 255], [620, 399], null, [706, 229], 'plains', [15, 16, 18, 45, 46], [[30, 4], [43, 4], [43, 22], [40, 22], [40, 25], [30, 25]], [623, 339], [671, 381]);
    regionsList[18] = new Region(18, -1, [675, 490], [695, 555], [590, 510], null, [585, 575], 'plains', [12, 19, 16, 17, 46], [[26, 26], [41, 26], [41, 23], [43, 23], [43, 34], [39, 34], [39, 37], [31, 37], [31, 32], [26, 32]], [538, 536], [624, 578]);
    regionsList[19] = new Region(19, -1, [290, 633], [215, 705], [138, 635], null, [210, 603], 'plains', [16, 18, 14], [[6, 26], [25, 26], [25, 32], [20, 32], [20, 42], [6, 42]], [148, 704], [219, 668]);

    regionsList[40] = new Region(40, 0, [1759, 731], [1773, 845], [1635, 1109], null, [1721, 1139], 'tundra', [60, 61, 41, 50, 42, 44], [[96, 39], [103, 39], [103, 41], [105, 41], [105, 52], [100, 52], [100, 67], [89, 67], [89, 51], [96, 51]], [1706, 1072], [1689, 1055]);
    regionsList[41] = new Region(41, 0, [1957, 881], [2083, 1061], [2117, 767], null, [2033, 771], 'tundra', [42, 40, 61], [[106, 41], [125, 41], [125, 45], [117, 45], [117, 50], [125, 50], [125, 57], [124, 57], [124, 64], [106, 64]], [2206, 764], [2186, 792]);
    regionsList[42] = new Region(42, 0, [2073, 653], [2161, 653], [2015, 655], null, [1907, 649], 'tundra', [41, 40, 44, 43], [[104, 32], [125, 32], [125, 40], [104, 40]], [2016, 606], [1987, 702]);
    regionsList[43] = new Region(43, 0, [2051, 491], [2049, 389], [2141, 223], null, [2065, 273], 'tundra', [42, 49], [[112, 4], [125, 4], [125, 31], [112, 31]], [2127, 162], [2239, 234]);
    regionsList[44] = new Region(44, 0, [1675, 607], [1773, 617], [1685, 523], null, [1781, 515], 'tundra', [42, 40, 50, 48, 49], [[92, 21], [103, 21], [103, 38], [92, 38]], [1793, 428], [1751, 537]);
    regionsList[45] = new Region(45, 0, [1011, 99], [1071, 170], [953, 177], null, [831, 145], 'tundra', [17, 46, 47], [[44, 4], [65, 4], [65, 12], [44, 12]], [944, 100], [940, 174]);
    regionsList[46] = new Region(46, 0, [835, 435], [989, 429], [1017, 339], null, [849, 313], 'tundra', [17, 18, 10, 47, 45], [[44, 13], [65, 13], [65, 29], [44, 29]], [959, 327], [1035, 318]);
    regionsList[47] = new Region(47, 0, [1221, 99], [1307, 395], [1281, 201], null, [1229, 311], 'tundra', [45, 46, 10, 48, 50], [[66, 4], [77, 4], [77, 43], [66, 43]], [1228, 247], [1233, 234]);
    regionsList[48] = new Region(48, 0, [1445, 345], [1443, 549], [1565, 289], null, [1549, 597], 'tundra', [47, 50, 44, 49], [[78, 4], [82, 4], [82, 10], [89, 10], [89, 4], [99, 4], [99, 12], [91, 12], [91, 38], [78, 38]], [1482, 263], [1516, 321]);
    regionsList[49] = new Region(49, 0, [1831, 101], [1903, 301], [1823, 201], null, [1761, 291], 'tundra', [48, 44, 43], [[100, 4], [111, 4], [111, 20], [92, 20], [92, 13], [100, 13]], [1889, 205], [1870, 189]);
    regionsList[50] = new Region(50, 0, [1375, 819], [1371, 969], [1559, 765], null, [1649, 767], 'tundra', [10, 11, 60, 40, 44, 48, 47], [[75, 44], [78, 44], [78, 39], [95, 39], [95, 50], [88, 50], [88, 62], [75, 62]], [1501, 751], [1645, 793]);

    regionsList[29] = new Region(29, 1, [707, 1965], [703, 2051], [855, 2059], null, [899, 1971], 'sand', [30, 32, 39, 67], [[37, 107], [54, 107], [54, 114], [58, 114], [58, 113], [60, 113], [60, 117], [58, 117], [58, 116], [54, 116], [54, 123], [37, 123]], [828, 1993], [820, 2092]);
    regionsList[30] = new Region(30, 1, [557, 2033], [553, 2115], [475, 2137], null, [447, 2027], 'sand', [29, 31, 32], [[23, 111], [36, 111], [36, 123], [23, 123], [23, 123]], [470, 2048], [497, 2114]);
    regionsList[31] = new Region(31, 1, [137, 2025], [277, 2027], [255, 2177], null, [247, 2095], 'sand', [30, 32, 33], [[6, 111], [22, 111], [22, 124], [5, 124], [5, 122], [6, 122]], [337, 2177], [210, 2196]);
    regionsList[32] = new Region(32, 1, [363, 1917], [261, 1847], [569, 1855], null, [487, 1907], 'sand', [29, 30, 31, 33, 38], [[13, 101], [36, 101], [36, 110], [13, 110]], [462, 1837], [516, 1877]);
    regionsList[33] = new Region(33, 1, [135, 1783], [137, 1715], [183, 1587], null, [147, 1901], 'sand', [31, 32, 38, 35], [[6, 84], [12, 84], [12, 110], [6, 110]], [135, 1636], [199, 1661]);
    regionsList[34] = new Region(34, 1, [900, 1332], [884, 1532], [1089, 1427], null, [996, 1408], 'sand', [65, 60, 36, 39, 37], [[48, 72], [63, 72], [63, 89], [47, 89], [47, 74], [48, 74]], [1068, 1373], [1056, 1463]);
    regionsList[35] = new Region(35, 1, [184, 1238], [276, 1432], [366, 1336], null, [270, 1324], 'sand', [14, 36, 37, 38, 33], [[6, 67], [23, 67], [23, 74], [24, 74], [24, 83], [6, 83]], [337, 1275], [316, 1373]);
    regionsList[36] = new Region(36, 1, [466, 1252], [566, 1186], [672, 1184], null, [770, 1188], 'sand', [12, 13, 14, 35, 37, 34], [[24, 64], [47, 64], [47, 73], [24, 73]], [716, 1255], [756, 1210]);
    regionsList[37] = new Region(37, 1, [554, 1432], [548, 1360], [702, 1362], null, [770, 1356], 'sand', [34, 36, 35, 38], [[25, 74], [46, 74], [46, 83], [25, 83]], [734, 1437], [778, 1388]);
    regionsList[38] = new Region(38, 1, [542, 1550], [572, 1716], [490, 1642], null, [384, 1628], 'sand', [39, 32, 33, 35, 37], [[13, 84], [36, 84], [36, 94], [39, 94], [39, 99], [36, 99], [36, 100], [13, 100]], [465, 1597], [442, 1676]);
    regionsList[39] = new Region(39, 1, [822, 1670], [824, 1752], [1024, 1752], null, [978, 1828], 'sand', [34, 38, 29, 65], [[43, 90], [63, 90], [63, 93], [62, 93], [62, 106], [43, 106], [43, 99], [40, 99], [40, 94], [43, 94]], [992, 1712], [987, 1788]);

    regionsList[60] = new Region(60, -1, [1368, 1328], [1464, 1326], [1512, 1170], null, [1326, 1206], 'grassland', [40, 50, 11, 64, 65, 34], [[64, 63], [88, 63], [88, 78], [64, 78]], [1460, 1246], [1506, 1265]);
    regionsList[61] = new Region(61, -1, [1930, 1214], [2052, 1326], [2198, 1218], null, [2084, 1208], 'grassland', [41, 40, 62], [[102, 65], [124, 65], [124, 77], [121, 77], [121, 78], [102, 78]], [2150, 1253], [2188, 1308]);
    regionsList[62] = new Region(62, -1, [1838, 1587], [2012, 1559], [2118, 1515], null, [1910, 1479], 'grassland', [61, 64, 63], [[100, 79], [121, 79], [121, 91], [113, 91], [113, 92], [100, 92]], [2075, 1479], [2166, 1499]);
    regionsList[63] = new Region(63, -1, [1678, 1705], [1988, 1801], [1910, 1807], null, [1964, 1715], 'grassland', [62, 64, 66, 68, 69], [[87, 93], [113, 93], [113, 94], [123, 94], [123, 106], [110, 106], [110, 105], [96, 105], [96, 106], [87, 106]], [1854, 1847], [1966, 1762]);
    regionsList[64] = new Region(64, -1, [1494, 1463], [1590, 1543], [1706, 1517], null, [1726, 1443], 'grassland', [62, 63, 66, 65, 60], [[77, 79], [99, 79], [99, 92], [87, 92], [87, 88], [80, 88], [80, 87], [77, 87]], [1742, 1587], [1752, 1483]);
    regionsList[65] = new Region(65, -1, [1174, 1602], [1182, 1449], [1336, 1471], null, [1222, 1497], 'grassland', [34, 39, 66, 60, 64], [[64, 79], [76, 79], [76, 87], [69, 87], [69, 99], [63, 99], [63, 94], [64, 94]], [1300, 1518], [1289, 1496]);
    regionsList[66] = new Region(66, -1, [1361, 1646], [1369, 1728], [1477, 1628], null, [1487, 1708], 'grassland', [64, 65, 63, 67], [[70, 88], [79, 88], [79, 89], [86, 89], [86, 105], [70, 105]], [1484, 1800], [1528, 1700]);
    regionsList[67] = new Region(67, -1, [1225, 1940], [1377, 1940], [1383, 2088], null, [1313, 2030], 'grassland', [66, 29], [[66, 106], [82, 106], [82, 122], [66, 122], [66, 116], [62, 116], [62, 117], [61, 117], [61, 113], [62, 113], [62, 114], [66, 114]], [1256, 2056], [1458, 2149]);
    regionsList[68] = new Region(68, -1, [1643, 2002], [1767, 2022], [1623, 2122], null, [1697, 2106], 'grassland', [69, 63], [[87, 107], [96, 107], [96, 108], [103, 108], [103, 124], [87, 124]], [1785, 2129], [1691, 2168]);
    regionsList[69] = new Region(69, -1, [2007, 2126], [2111, 2136], [2105, 2016], null, [2051, 1958], 'grassland', [63, 68], [[110, 107], [123, 107], [123, 122], [104, 122], [104, 115], [110, 115]], [2169, 2016], [2066, 2054]);
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

function collectFood(player) {
    var foodCount = 0;
    regionsList.forEach((region) => {
        if (player.id === region.owner) foodCount += 1;
    });
}

// ===================================================================
// End - Utility Functions
// ===================================================================

// ===================================================================
// Start - AI
// ===================================================================

// Basic Defence Logic:
//  * Bolster defences that neighbor a player. Try to have equal troops on border as opponent. If defence = 0; attack.
//  * If defences are equal, fill the cells that aren't borders with 3 troops at max.
//  * If both conditions are satisfied, add troops to to fight weakest opponent border. 
// Basic Attack Logic:
// * Stack all troops on one border and attack from the border cell

/**
 * Basic Attack Logic:
 * Stack all troops on one border and attack from the border cell
 */


//Start Defence

/**
 * Basic Defence Logic:
 * Bolster defences that neighbor a player. Try to have equal troops on border as opponent. If defence = 0; attack.
 * If defences are equal, fill the cells that aren't borders with 3 troops at max.
 * If both conditions are satisfied, add troops to to fight weakest opponent border. 
 * 
 * @param {*} player : Player Object
 * @param {*} inputRegions : Total Regions
 */

function DefenceAiTurn(aiplayer, inputRegions) {

    console.log('<<<<<<<<<<<<<<<AI TIME>>>>>>>>>>>>>>>>>>>>')

    /*
     * Initial Data Collection
     */

    const regions = inputRegions.filter(Boolean);

    var aiOwnedRegions = [];

    for (var i = 0; i < regions.length; i++) {
        if (regions[i].owner === aiplayer.ID) {
            aiOwnedRegions.push(regions[i]);
        }
    }

    // console.log(aiOwnedRegions);

    var borderRegions = [];
    var needsUpgrade = [];
    var zeroTroopAttack = [];                                                                   // Stores objects {sourceID, barracks, farm}

    for (var i = aiOwnedRegions.length - 1; i >= 0; i--) {                                            // Iterates through owned regions
        for (var neigh = 0; neigh < aiOwnedRegions[i].neighbors.length; neigh++) {                // Iterates through owned neighbors
            // console.log(aiOwnedRegions[i].neighbor[neigh]);
            let potentialEnemy = aiOwnedRegions[i].neighbors[neigh];

            zeroTroopAttack.push(checkZeroEnemies(aiOwnedRegions[i], potentialEnemy, inputRegions));

            function checkZeroEnemies(sourceRegion, potentialDestination, regionData) {
                // console.log('ENEMY CHECK '+ potentialDestination)
                // console.log('Destination is' + (regionData[potentialDestination].ID !== 1))
                if (regionData[potentialDestination].owner !== 1) {                                         // Checks if neighbor is enemy
                    // console.log('<<<<<<<<<<<<<<<ADD ENEMIES>>>>>>>>>>>>>>>>>>>>');
                    //return {destination: potentialDestination, source: [sourceRegion.id]};      // Stores destination as the index of the zeroTroopAttack array and the source as an array

                    if ((!regionData[potentialDestination].troop['soldier'] && !regionData[potentialDestination].troop['soldierRanged']) || (sourceRegion.troop['soldier'] && (sourceRegion.troop['soldier'].count > 2)) || (sourceRegion.troop['soldierRanged'] && (sourceRegion.troop['soldierRanged'].count > 2)) || (sourceRegion.troop['soldier'] && sourceRegion.troop['soldierRanged'] && (sourceRegion.troop['soldier'].count + sourceRegion.troop['soldierRanged'].count > 2))) {
                        return { destination: potentialDestination, source: sourceRegion.id };
                    }
                }
            }

        }

        let farm, barracks, soldier;

        //console.log(aiOwnedRegions);

        if (!aiOwnedRegions[i].bldg['farm']) {                                                   // Checks if there is a farm
            farm = true;
        } else {
            farm = false;
        }

        if (!aiOwnedRegions[i].bldg['barracks']) {                                                   // Checks if there is a barracks
            barracks = true;
        } else {
            barracks = false;
        }

        // console.log('AI Troops');
        // console.log(aiOwnedRegions[i].troop);
        // console.log(aiOwnedRegions[i].troop);


        if (!aiOwnedRegions[i].troop || !aiOwnedRegions[i].troop['soldier'] || !aiOwnedRegions[i].troop['soldierRanged']) {                  // Checks is region has troops
            soldier = 2;
        } else if (aiOwnedRegions[i].troop['soldier'].count + aiOwnedRegions[i].troop['soldierRanged'].count < 4) {
            // console.log(3 - aiOwnedRegions[i].troop['soldier'].count);                              
            soldier = 4 - aiOwnedRegions[i].troop['soldier'].count - aiOwnedRegions[i].troop['soldierRanged'].count;
        } else if (aiOwnedRegions[i].cap === true) {
            soldier = 4;
        } else if (aiOwnedRegions[i].id > 28 && aiOwnedRegions[i].id < 40) {
            soldier = 1;
        } else {
            soldier = 0;
        }

        if (farm || barracks || soldier) {
            needsUpgrade.push({
                id: aiOwnedRegions[i].id, bar: barracks,
                farm: farm, sold: soldier
            })                                                     // Stores easy access call so that if a barracks/farm needs to be built.
        }

    }

    // console.log(needsUpgrade);

    borderRegions = borderRegions.filter(Boolean);                                              // Removes null values from border Region Array
    zeroTroopAttack = zeroTroopAttack.filter(Boolean);                                          // Removes null values from zerTroopAttack Array

    // console.log('ZERO TROOP = ');
    // console.log(zeroTroopAttack);

    /*
     * Initial Attack Phase
     * 
     * Iterate through all possible 0 unit attacks. If there is more than one way for a region to attack, wait. 
     * Have all single attack regions attack and then have multi-attack regions attack with the reduced options.
     */

    var fightCount = 0;

    for (var i = 0; i < zeroTroopAttack.length; i++) {

        let sourcesUsed = [-1];                                                                 // Makes the first element not null

        for (var b = 0; b < zeroTroopAttack.length; b++) {                                       // Removes all sources that have already attacked
            // console.log(sourcesUsed.includes(zeroTroopAttack[b].source));
            if (sourcesUsed.includes(zeroTroopAttack[b].source)) {
                zeroTroopAttack.pop(zeroTroopAttack[b]);
                b--;
            }
        }
        // console.log('source');
        // console.log(zeroTroopAttack[i].source);
        // console.log('destination');
        // console.log(inputRegions[zeroTroopAttack[i].destination]);                                        // Attacks if only one source can reach destination
        // console.log(inputRegions[zeroTroopAttack[i].source].troop['soldier']);

        // console.log(inputRegions[zeroTroopAttack[i].source]);
        if (inputRegions[zeroTroopAttack[i].source].troop['soldier'] != null && inputRegions[zeroTroopAttack[i].source].troop['soldier'].count !== 0) {
            moveFight(inputRegions[zeroTroopAttack[i].source], inputRegions[zeroTroopAttack[i].destination]);

            fightCount++;
            // console.log("source")
            // console.log(inputRegions[zeroTroopAttack[i].source])
            // console.log("destination")
            // console.log(inputRegions[zeroTroopAttack[i].destination])
        }

    }


    /**
     * Troop build stage
     */

    var temp = needsUpgrade;
    var count = 0;



    while (players[1].foodCount > 0 && count < temp.length) {                                       // Foodcount is not zero and there is a soldier upgrade still needed
        for (var i = 0; i < temp.length; i++) {
            // console.log('Sold ' + temp[i].sold);
            if (temp[i].sold != 0 && players[1].foodCount > 5) {                     // If the soldiers needed is not zero, the player has food and the player does not need a barracks.
                if (inputRegions[temp[i].id].bldg['barracks']) {
                    buildSoldier(inputRegions[temp[i].id]);
                    if (temp[i].sold != 0 && i % 3 == 1) {
                        buildSoldierRanged(inputRegions[temp[i].id]);
                    }
                }
                temp[i].sold--;
                count = 0;
            } else {
                count++;
            }
        }
    }

    console.log(players[1].goldCount);
    count = 0;

    while (players[1].goldCount > 0 && count < temp.length) {
        for (var i = 0; i < temp.length; i++) {
            if (needsUpgrade[i].farm && players[1].goldCount > 0) {
                buildFarm(inputRegions[temp[i].id]);
                temp[i].farm = false;
                count = 0;
            } else {
                count++;
            }
        }

        for (var i = 0; i < temp.length; i++) {
            if (needsUpgrade[i].bar && players[1].goldCount > 0) {
                buildBarracks(inputRegions[temp[i].id]);
                temp[i].bar = false;
                count = 0;
            } else {
                count++;
            }
        }


    }


    /**
     * End Turn
     */

    // toggleTurn();

    players[currentPlayerTurn].cameraCoord = { x: cameraOrigin.x, y: cameraOrigin.y }

    for (var i = 0; i < regionsList.length; i++) {

        if (regionsList[i] != null && regionsList[i].owner == currentPlayerTurn) {
            players[currentPlayerTurn].goldCount += 1;
        }
        if (regionsList[i] != null && regionsList[i].owner == currentPlayerTurn && regionsList[i].bldg["farm"] != null) {
            players[currentPlayerTurn].foodCount += 1;
        }

        if (regionsList[i] != null && regionsList[i].troop["soldier"] != null) {
            regionsList[i].troop["soldier"].hasMoved = 0;
        }

        if (regionsList[i] != null && regionsList[i].troop["soldierRanged"] != null) {
            regionsList[i].troop["soldierRanged"].hasMoved = 0;
        }

        if (regionsList[i] != null && regionsList[i].cap != null) {
            regionsList[i].cap.hasMoved = false;

        }


    }

    currentPlayerTurn = turnCount % 2;
    turnCount++;

    // console.log("GOING TO " + players[currentPlayerTurn].cameraCoord.x + " " + players[currentPlayerTurn].cameraCoord.y)
    changeCameraOrigin(players[currentPlayerTurn].cameraCoord.x, players[currentPlayerTurn].cameraCoord.y);
    createArray(cameraOrigin);

    // FOR RYAN ----------------------------------------------------------------------
    gameEngine.GUIEntities[5].sword.elapsedTime = 0; // Resets sword animation
    displayEnd = true; // Displays background
    gameEngine.GUIEntities[5].displayBattle(fightCount); // Displays text (param: # of battles)
    // FOR RYAN ----------------------------------------------------------------------



}




// ===================================================================
// End - AI
// ===================================================================


// ===================================================================
// Start - Menu Functions
// ===================================================================
function moveToFriendly(src, dest) {

}

function moveFight(source, destination) {
    var validMove = source.neighbors.includes(destination.id);
    var validSource = source.troop['soldier'] != null || source.troop['soldierRanged'] != null;


    if ((destination.owner === -1 || destination.owner === source.owner ||
        (destination.troop['soldier'] == null && destination.troop['soldierRanged'] == null && destination.owner != source.owner))
        && validMove && validSource) {
        destination.owner = source.owner;

        // Move to empty region
        if ((destination.troop['soldier'] == null && destination.troop['soldierRanged'] == null) &&
            ((source.troop['soldier'] != null && source.troop['soldier'].hasMoved < source.troop['soldier'].count)
                || (source.troop['soldierRanged'] != null && source.troop['soldierRanged'].hasMoved < source.troop['soldierRanged'].count))) {

            // Movement for the melee soldiers
            if (destination.troop['soldier'] == null && source.troop['soldier'] != null
                && source.troop['soldier'].hasMoved < source.troop['soldier'].count) {
                if (source.owner == 0) {
                    destination.troop["soldier"] = new Soldier(gameEngine, destination.troopXY[0], destination.troopXY[1]);
                } else {
                    destination.troop["soldier"] = new Alien(gameEngine, destination.troopXY[0], destination.troopXY[1]);
                }

                // Checking if moving all troops from source or not
                if (source.troop['soldier'].hasMoved == 0) {
                    destination.troop['soldier'].count = source.troop['soldier'].count;
                    destination.troop['soldier'].hasMoved = source.troop['soldier'].count;
                    source.troop['soldier'].removeFromWorld = true;
                    source.troop['soldier'] = null;
                }
                else {
                    destination.troop['soldier'].count = source.troop['soldier'].count - source.troop['soldier'].hasMoved;
                    destination.troop['soldier'].hasMoved = source.troop['soldier'].count - source.troop['soldier'].hasMoved;
                    source.troop['soldier'].count = source.troop['soldier'].hasMoved;
                }

                gameEngine.addEntity(destination.troop["soldier"]);
            }


            // Movement for the ranged soldiers
            if (destination.troop['soldierRanged'] == null && source.troop['soldierRanged'] != null
                && source.troop['soldierRanged'].hasMoved < source.troop['soldierRanged'].count) {

                if (source.owner == 0) {
                    destination.troop["soldierRanged"] = new SoldierRanged(gameEngine, destination.rangedXY[0], destination.rangedXY[1]);
                } else {
                    destination.troop["soldierRanged"] = new AlienRanged(gameEngine, destination.rangedXY[0], destination.rangedXY[1]);
                }

                // Checking if moving all troops from source or not
                if (source.troop['soldierRanged'].hasMoved == 0) {
                    destination.troop['soldierRanged'].count = source.troop['soldierRanged'].count;
                    destination.troop['soldierRanged'].hasMoved = source.troop['soldierRanged'].count;
                    source.troop['soldierRanged'].removeFromWorld = true;
                    source.troop['soldierRanged'] = null;
                }
                else {
                    destination.troop['soldierRanged'].count = source.troop['soldierRanged'].count - source.troop['soldierRanged'].hasMoved;
                    destination.troop['soldierRanged'].hasMoved = source.troop['soldierRanged'].count - source.troop['soldierRanged'].hasMoved;
                    source.troop['soldierRanged'].count = source.troop['soldierRanged'].hasMoved;
                }

                gameEngine.addEntity(destination.troop["soldierRanged"]);

            }

        }
        // Move to occupied region
        else if ((destination.troop['soldier'] != null || destination.troop['soldierRanged'] != null) &&
            ((source.troop['soldier'] != null && source.troop['soldier'].hasMoved < source.troop['soldier'].count)
                || (source.troop['soldierRanged'] != null && source.troop['soldierRanged'].hasMoved < source.troop['soldierRanged'].count))) {


            // Movement for the melee soldiers
            if (destination.troop['soldier'] == null && source.troop['soldier'] != null
                && source.troop['soldier'].hasMoved < source.troop['soldier'].count) {
                if (source.owner == 0) {
                    destination.troop["soldier"] = new Soldier(gameEngine, destination.troopXY[0], destination.troopXY[1]);
                } else {
                    destination.troop["soldier"] = new Alien(gameEngine, destination.troopXY[0], destination.troopXY[1]);
                }

                // Checking if moving all troops from source or not
                if (source.troop['soldier'].hasMoved == 0) {
                    destination.troop['soldier'].count = source.troop['soldier'].count;
                    destination.troop['soldier'].hasMoved = source.troop['soldier'].count;
                }
                else {
                    destination.troop['soldier'].count = source.troop['soldier'].count - source.troop['soldier'].hasMoved;
                    destination.troop['soldier'].hasMoved = source.troop['soldier'].count - source.troop['soldier'].hasMoved;
                    source.troop['soldier'].count = source.troop['soldier'].hasMoved;
                }

                gameEngine.addEntity(destination.troop["soldier"]);
            }

            // Movement for the ranged soldiers
            if (destination.troop['soldierRanged'] == null && source.troop['soldierRanged'] != null
                && source.troop['soldierRanged'].hasMoved < source.troop['soldierRanged'].count) {

                if (source.owner == 0) {
                    destination.troop["soldierRanged"] = new SoldierRanged(gameEngine, destination.rangedXY[0], destination.rangedXY[1]);
                } else {
                    destination.troop["soldierRanged"] = new AlienRanged(gameEngine, destination.rangedXY[0], destination.rangedXY[1]);
                }

                // Checking if moving all troops from source or not
                if (source.troop['soldierRanged'].hasMoved == 0) {
                    destination.troop['soldierRanged'].count = source.troop['soldierRanged'].count;
                    destination.troop['soldierRanged'].hasMoved = source.troop['soldierRanged'].count;
                }
                else {
                    destination.troop['soldierRanged'].count = source.troop['soldierRanged'].count - source.troop['soldierRanged'].hasMoved;
                    destination.troop['soldierRanged'].hasMoved = source.troop['soldierRanged'].count - source.troop['soldierRanged'].hasMoved;
                    source.troop['soldierRanged'].count = source.troop['soldierRanged'].hasMoved;
                }

                gameEngine.addEntity(destination.troop["soldierRanged"]);
            }

            if (destination.troop['soldier'] != null && source.troop['soldier'] != null
                && source.troop['soldier'].hasMoved < source.troop['soldier'].count) {
                if (source.troop['soldier'].hasMoved == 0) {
                    destination.troop['soldier'].count += source.troop['soldier'].count;
                    destination.troop['soldier'].hasMoved += source.troop['soldier'].count;
                    source.troop['soldier'].removeFromWorld = true;
                    source.troop['soldier'] = null;
                }
                else {
                    destination.troop['soldier'].count += source.troop['soldier'].count - source.troop['soldier'].hasMoved;
                    destination.troop['soldier'].hasMoved += source.troop['soldier'].count - source.troop['soldier'].hasMoved;
                    source.troop['soldier'].count = source.troop['soldier'].hasMoved;
                }
            }

            if (destination.troop['soldierRanged'] != null && source.troop['soldierRanged'] != null
                && source.troop['soldierRanged'].hasMoved < source.troop['soldierRanged'].count) {
                if (source.troop['soldierRanged'].hasMoved == 0) {
                    destination.troop['soldierRanged'].count += source.troop['soldierRanged'].count;
                    destination.troop['soldierRanged'].hasMoved += source.troop['soldierRanged'].count;
                    source.troop['soldierRanged'].removeFromWorld = true;
                    source.troop['soldierRanged'] = null;
                }
                else {
                    destination.troop['soldierRanged'].count += source.troop['soldierRanged'].count - source.troop['soldierRanged'].hasMoved;
                    destination.troop['soldierRanged'].hasMoved += source.troop['soldierRanged'].count - source.troop['soldierRanged'].hasMoved;
                    source.troop['soldierRanged'].count = source.troop['soldierRanged'].hasMoved;
                }
            }


        }
    }
    else if (validMove && validSource) {


        var atkPow = 0;
        if (source.troop['soldier'] != null) {
            atkPow += (source.troop['soldier'].count - source.troop['soldier'].hasMoved) * source.troop['soldier'].atk;
        }

        if (source.troop['soldierRanged'] != null) {
            atkPow += (source.troop['soldierRanged'].count - source.troop['soldierRanged'].hasMoved) * source.troop['soldierRanged'].atk;
        }


        var defPow = 0;
        if (destination.troop['soldier'] != null) {
            defPow += Number(destination.troop['soldier'].count) * Number(destination.troop['soldier'].def);
        }


        if (destination.troop['soldierRanged'] != null) {
            defPow += Number(destination.troop['soldierRanged'].count) * Number(destination.troop['soldierRanged'].def);
        }

        var atkCount = 0;
        var defCount = 0;

        while (defPow > 0 && atkPow > 0) {
            if (Math.random() > 0.5) {
                atkPow--
                if (source.troop['soldier'] && source.troop['soldier'].count - source.troop['soldier'].hasMoved > 0) {
                    source.troop['soldier'].count--;
                } else if (source.troop['soldierRanged'] && source.troop['soldierRanged'].count - source.troop['soldierRanged'].hasMoved > 0 && atkCount == 1) {
                    source.troop['soldierRanged'].count--;
                    atkCount--;
                } else {
                    atkCount++;
                }

            } else {
                defPow--
                if (destination.troop['soldierRanged'] && destination.troop['soldierRanged'].count > 0) {
                    destination.troop['soldierRanged'].count--;
                } else if (destination.troop['soldier'] && destination.troop['soldier'].count > 0 && defCount == 1) {
                    destination.troop['soldier'].count--;
                    defCount--;
                } else {
                    defCount++;
                }
            }

        }

        //console.log('ATTACK = ' + atkPow);

        if (atkPow > defPow) {
            // The captain will die if you defeat the enemy
            if (destination.cap != null) {
                destination.cap.removeFromWorld = true;
                destination.cap = null;
            }

            if (destination.troop['soldier'] != null) {
                console.log("removing dest soldier")
                destination.troop['soldier'].removeFromWorld = true;
                destination.troop['soldier'] = null;
                console.log(destination.troop['soldier'])
            }

            if (destination.troop['soldierRanged'] != null) {
                console.log("removing dest soldierRanged")
                destination.troop['soldierRanged'].removeFromWorld = true;
                destination.troop['soldierRanged'] = null;
                console.log(destination.troop['soldierRanged'])
            }

            if (source.troop['soldier'] != null && source.troop['soldier'].count == 0) {
                source.troop['soldier'].removeFromWorld = true;
                source.troop['soldier'] = null;
            }

            if (source.troop['soldierRanged'] != null && source.troop['soldierRanged'].count == 0) {
                source.troop['soldierRanged'].removeFromWorld = true;
                source.troop['soldierRanged'] = null;
            } 

            destination.owner = source.owner;
            console.log("FIGHT MOVE FROM")
            console.log(source)
            console.log("FIGHT MOVE TO")
            console.log(destination)


            console.log(source.troop['soldier'])
            console.log(source.troop['soldierRanged'])
            console.log(destination.troop['soldier'])
            console.log(destination.troop['soldierRanged'])
            moveFight(source, destination);

            // var noRangedMovement = source.troop['soldierRanged'] && (source.troop['soldierRanged'].count > 0 && source.troop['soldierRanged'].hasMoved == 0 && source.troop['soldier'] == null);
            // var noSoldierMovement = source.troop['soldier'] && (source.troop['soldier'].count > 0 && source.troop['soldier'].hasMoved == 0 && source.troop['soldierRanged'] == null);
            // var noMovementEither = source.troop['soldierRanged'] && source.troop['soldier'] && (source.troop['soldier'].count > 0 && source.troop['soldier'].hasMoved == 0) && (source.troop['soldierRanged'].count > 0 && source.troop['soldierRanged'].hasMoved == 0);            
            // var noMovement = noSoldierMovement || noRangedMovement || noMovementEither;

            // if (noMovement) {

            //     console.log('No Movement');

            //     destination.owner = source.owner;
            //     destination.troop = new Object(source.troop);

            //     if (destination.troop['soldier'] != null) {
            //         destination.troop['soldier'].hasMoved = destination.troop['soldier'].count;
            //         destination.troop['soldier'].x = destination.troopXY[0];
            //         destination.troop['soldier'].y = destination.troopXY[1];
            //     }
            //     if (destination.troop['soldierRanged'] != null) {
            //         destination.troop['soldierRanged'].hasMoved = destination.troop['soldierRanged'].count;
            //         destination.troop['soldierRanged'].x = destination.rangedXY[0];
            //         destination.troop['soldierRanged'].y = destination.rangedXY[1];
            //     }


        } else {

            if (source.troop['soldier'] != null) {
                source.troop['soldier'].removeFromWorld = true;
                source.troop['soldier'] = null;
            }

            if (source.troop['soldierRanged'] != null) {
                source.troop['soldierRanged'].removeFromWorld = true;
                source.troop['soldierRanged'] = null;
            }

            if (destination.troop['soldier'] != null && destination.troop['soldier'].count == 0) {
                destination.troop['soldier'].removeFromWorld = true;
                destination.troop['soldier'] = null;
            }

            if (destination.troop['soldierRanged'] != null && destination.troop['soldierRanged'].count == 0) {
                destination.troop['soldierRanged'].removeFromWorld = true;
                destination.troop['soldierRanged'] = null;
            }

            // console.log('Movement');

            // destination.owner = source.owner;
            // destination.troop = [];

            // if (source.owner == 0 && source.troop['soldier'].count > 0) {
            //     destination.troop["soldier"] = new Soldier(gameEngine, destination.troopXY[0], destination.troopXY[1]);
            //     gameEngine.addEntity(destination.troop["soldier"]);
            // } else if (source.owner == 1 && source.troop['soldier'].count > 0) {
            //     destination.troop["soldier"] = new Alien(gameEngine, destination.troopXY[0], destination.troopXY[1]);
            //     gameEngine.addEntity(destination.troop["soldier"]);
            // }

            // if (source.owner == 0 && source.troop['soldierRanged'].count > 0) {
            //     destination.troop["soldierRanged"] = new SoldierRanged(gameEngine, destination.rangedXY[0], destination.rangedXY[1]);
            //     gameEngine.addEntity(destination.troop["soldierRanged"]);
            // } else if (source.owner == 1 && source.troop['soldierRanged'].count > 0) {
            //     destination.troop["soldierRanged"] = new AlienRanged(gameEngine, destination.rangedXY[0], destination.rangedXY[1]);
            //     gameEngine.addEntity(destination.troop["soldierRanged"]);
            // }

            // if (destination.troop['soldier'] != null) destination.troop['soldier'].hasMoved = destination.troop['soldier'].count - source.troop['soldier'].hasMoved;
            // if (destination.troop['soldierRanged'] != null) destination.troop['soldierRanged'].hasMoved = destination.troop['soldierRanged'].count - source.troop['soldierRanged'].hasMoved;

        }


    }

    // Updates fog of war
    if (gameEngine.GUIEntities[0] != null) {
        gameEngine.GUIEntities[0].displays = getFogOfWar();
        //console.log(gameEngine.GUIEntities[0].displays)
    }
}

function moveCap(source, destination) {

    var validMove = source.neighbors.includes(destination.id);

    console.log('valid');

    if (destination.owner === source.owner && validMove) {

        destination.cap = source.cap;
        destination.cap.hasMoved = true;
        destination.cap.x = destination.capXY[0];
        destination.cap.y = destination.capXY[1];
        // source.cap.removeFromWorld = true;
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
    this.goldIcon = AM.getAsset("./img/sidebar/gold_icon.png")


    this.foodFlag = false;
    this.goldFlag = false;

    this.hit = [{ name: "food", x: 962, y: 15, w: 90, h: 25 },
    { name: "gold", x: 1096, y: 10, w: 90, h: 25 }];


    GUIEntity.call(this, game, gameEngine.surfaceWidth - 380, 0);
}

ResourceDisplay.prototype = new GUIEntity();
ResourceDisplay.prototype.constructor = ResourceDisplay;


ResourceDisplay.prototype.update = function () {

    if (gameEngine.mouseOver != null &&
        gameEngine.mouseOver.layerX >= this.x &&
        gameEngine.mouseOver.layerY >= this.y &&
        gameEngine.mouseOver.layerX <= gameEngine.surfaceWidth &&
        gameEngine.mouseOver.layerY <= 50) {
        var temp = getClickedItem(this.hit, gameEngine.mouseOver.layerX, gameEngine.mouseOver.layerY);
        console.log(temp);
        // Submenu
        if (temp != null && temp.name == "food") {
            this.foodFlag = true;
        } else {
            this.foodFlag = false;
        }
        if (temp != null && temp.name == "gold") {
            this.goldFlag = true;
        } else {
            this.goldFlag = false;
        }
        temp = null;
        gameEngine.mouseOver = null;
    }



}
ResourceDisplay.prototype.draw = function (ctx) {
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";


    // Draw the border
    ctx.globalAlpha = 0.9;
    ctx.drawImage(this.border, this.x, this.y);
    ctx.globalAlpha = 1.0;

    // Draw the Food Icon and Count
    ctx.drawImage(this.foodIcon, this.x + 60, this.y + 10);
    ctx.fillText(players[currentPlayerTurn].foodCount, this.x + 100, this.y + 35);

    //Draw the Money Icon and Count
    ctx.drawImage(this.goldIcon, this.x + 200, this.y + 10);
    ctx.fillText(players[currentPlayerTurn].goldCount, this.x + 230, this.y + 35);


    if (this.foodFlag) {
        displayTooltip("Generating " + getFood() + " food per turn", this.x, this.y + 85, 325, 35)
    }
    if (this.goldFlag) {
        displayTooltip("Generating " + getGold() + " gold per turn", this.x + 100, this.y + 85, 325, 35)
    }


    function getFood() {
        var output = 0;
        for (var i = 0; i < regionsList.length; i++) {

            if (regionsList[i] != null && regionsList[i].owner == currentPlayerTurn && regionsList[i].bldg["farm"] != null) {
                output += 1;

            }
        }
        return output;
    }

    function getGold() {
        var output = 0;
        for (var i = 0; i < regionsList.length; i++) {

            if (regionsList[i] != null && regionsList[i].owner == currentPlayerTurn) {
                output += 1;
            }
        }
        return output;
    }
    function displayTooltip(text, x, y, w, h) {
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "#222"
        ctx.fillRect(x - 50, y - 35, w, h);
        ctx.fillStyle = '#bada55';
        ctx.fillText(text, x - 35, y - 10)
        ctx.globalAlpha = 1.0;
    }



}
// ===================================================================
// End - Resource Display
// ===================================================================




// ===================================================================
// Start - Stats Display
// ===================================================================
function StatDisplay(game) {

    this.soldierCaptain = AM.getAsset("./img/sprites/cap_soldier_standing.png");
    this.soldier = AM.getAsset("./img/sprites/soldier_standing.png");
    this.soldierRanged = AM.getAsset("./img/sprites/soldier_ranged_standing.png");
    this.barracksBlue = AM.getAsset("./img/sprites/barracks_blue.png");
    this.farmBlue = AM.getAsset("./img/sprites/farm_blue.png");

    this.showBtn = AM.getAsset("./img/show_stat.png");
    this.hideBtn = AM.getAsset("./img/hide_stat.png");

    this.isHidden = false;

    this.hit = [{ name: "show", x: gameEngine.surfaceWidth - 36, y: 80, w: 36, h: 45 },
    { name: "hide", x: gameEngine.surfaceWidth - 414, y: 80, w: 36, h: 45 }];

    this.display = AM.getAsset("./img/sidebar/stat_display.png");
    GUIEntity.call(this, game, gameEngine.surfaceWidth - 380, 50);
}

StatDisplay.prototype = new GUIEntity();
StatDisplay.prototype.constructor = StatDisplay;

StatDisplay.prototype.update = function () {

    if (selectedRegion != null &&
        gameEngine.click != null &&
        gameEngine.click.x >= this.hit[0].x &&
        gameEngine.click.x <= this.hit[0].x + this.hit[0].w &&
        gameEngine.click.y >= this.hit[0].y &&
        gameEngine.click.y <= this.hit[0].y + this.hit[0].h) {
        this.isHidden = false;
        gameEngine.click = null;
    }
    else if (selectedRegion != null &&
        gameEngine.click != null &&
        gameEngine.click.x >= this.hit[1].x &&
        gameEngine.click.x <= this.hit[1].x + this.hit[1].w &&
        gameEngine.click.y >= this.hit[1].y &&
        gameEngine.click.y <= this.hit[1].y + this.hit[1].h) {
        this.isHidden = true;
        gameEngine.click = null;
    }
}

StatDisplay.prototype.draw = function (ctx) {
    // Barracks



    if (selectedRegion != null && !this.isHidden) {
        ctx.drawImage(this.hideBtn, gameEngine.surfaceWidth - 414, 80);
        var tempText = "";
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
        ctx.globalAlpha = 0.9;
        // Draw the border
        ctx.drawImage(this.display, this.x, this.y);
        ctx.globalAlpha = 1.0;
        ctx.fillText("Selected Region Stats", gameEngine.surfaceWidth - 350, 85);

        ctx.font = "19px Arial";

        // Soldier
        ctx.drawImage(this.soldier, gameEngine.surfaceWidth - 350, 100, 35, 40);

        if (selectedRegion.troop != null && selectedRegion.troop["soldier"] != null) {
            var soldierCount = selectedRegion.troop["soldier"].count;
            var soldierAtk = selectedRegion.troop["soldier"].atk;
            var soldierDef = selectedRegion.troop["soldier"].def;
            if (selectedRegion.cap != null) {
                soldierAtk *= 2;
                soldierDef *= 2;
            }
            tempText = "X " + soldierCount +
                " (Total atk: " + soldierCount * soldierAtk +
                " Total def: " + soldierCount * soldierDef + ")"
        } else {
            tempText = "X 0 (Total atk: 0 Total def: 0)"
        }
        ctx.fillText(tempText, gameEngine.surfaceWidth - 310, 130);


        // Ranged
        ctx.drawImage(this.soldierRanged, gameEngine.surfaceWidth - 350, 148, 35, 40);
        if (selectedRegion.troop != null && selectedRegion.troop["soldierRanged"] != null) {

            var rangedCount = selectedRegion.troop["soldierRanged"].count;
            var rangedAtk = selectedRegion.troop["soldierRanged"].atk;
            var rangedDef = selectedRegion.troop["soldierRanged"].def;
            if (selectedRegion.cap != null) {

                rangedAtk *= 2;
                rangedDef *= 2;
            }
            tempText = "X " + rangedCount +
                " (Total atk: " + rangedCount * rangedAtk +
                " Total def: " + rangedCount * rangedDef + ")"
        } else {
            tempText = "X 0 (Total atk: 0 Total def: 0)"
        }
        ctx.fillText(tempText, gameEngine.surfaceWidth - 310, 178);

        // Soldier Captain
        ctx.drawImage(this.soldierCaptain, gameEngine.surfaceWidth - 350, 196, 35, 40);

        if (selectedRegion.cap != null) {
            tempText = "Present";
        } else {
            tempText = "Not Present";
        }
        ctx.fillText(tempText, gameEngine.surfaceWidth - 310, 226);

        // Farm
        ctx.drawImage(this.farmBlue, gameEngine.surfaceWidth - 350, 246, 64, 40);
        if (selectedRegion.bldg["farm"] != null) {
            tempText = "Built";
        } else {
            tempText = "Not Built";
        }
        ctx.fillText(tempText, gameEngine.surfaceWidth - 280, 271);

        // Barracks
        ctx.drawImage(this.barracksBlue, gameEngine.surfaceWidth - 350, 297, 46, 40);
        if (selectedRegion.bldg["barracks"] != null) {
            tempText = "Built";
        } else {
            tempText = "Not Built";
        }
        ctx.fillText(tempText, gameEngine.surfaceWidth - 298, 325);




    } else if (selectedRegion != null) {
        ctx.drawImage(this.showBtn, gameEngine.surfaceWidth - 36, 80);
    }

}
// ===================================================================
// End - Stat Display
// ===================================================================












// ===================================================================
// Start - Map Display
// ===================================================================
function MapDisplay(game) {
    this.border = AM.getAsset("./img/map/map_master4.png");
    this.endGame = null;
    Entity.call(this, game, 0, 0);
}

MapDisplay.prototype = new Entity();
MapDisplay.prototype.constructor = MapDisplay;

MapDisplay.prototype.update = function (ctx) {
    // console.log(players[0].cameraCoord);

    for (var i = 0; i < regionsList.length; i++) {
        if (regionsList[i] != null && regionsList[i] != selectedRegion) {
            setSpritesToUnselected(regionsList[i]);
        }
    }
    if (selectedRegion != null) {
        setSpritesToSelected(selectedRegion);
    }
    var isThereCaptainForPlayer0 = false;
    var isThereCaptainForPlayer1 = false;

    // Hard worker
    for (var i = 0; i < regionsList.length; i++) {
        if (regionsList[i] != null) {
            updateFlag(regionsList[i]);

            if (regionsList[i].bldg["farm"] != null) {
                regionsList[i].bldg["farm"].owner = regionsList[i].owner;
            }
            if (regionsList[i].bldg["barracks"] != null) {
                regionsList[i].bldg["barracks"].owner = regionsList[i].owner;
            }

            // gameEngine.GUIEntities[0].displays = new Set();
            // if (regionsList[i] != null && regionsList[i].owner != currentPlayerTurn) {
            //     gameEngine.GUIEntities[0].displays.add(i);
            // }

            // Check for winner
            if (regionsList[i].cap != null) {
                if (regionsList[i].owner == 0) {
                    isThereCaptainForPlayer0 = true;
                } else {
                    isThereCaptainForPlayer1 = true;
                }
            }

        }
    }

    if (!isThereCaptainForPlayer1) {
        // console.log("PLAYER 0 WINS");
        deleteEverything("YOU WIN");
        // TRIGGER GAME OVER SCREEN
    }

    if (!isThereCaptainForPlayer0) {
        // console.log("PLAYER 1 WINS");
        deleteEverything("YOU LOST");
        // TRIGGER GAME OVER SCREEN
    }

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

    if (this.endGame != null) {
        ctx.fillStyle = "black";
        ctx.font = "150px Arial";
        ctx.fillText(this.endGame, (gameEngine.surfaceWidth / 2) - (370), 430);

        ctx.fillStyle = "white";
        ctx.font = "150px Arial";
        ctx.fillText(this.endGame, (gameEngine.surfaceWidth / 2) - (370) + 3, 430 + 3);
    } else {
        // ctx.globalAlpha = 0.6;
        // ctx.fillStyle = "black";
        // ctx.font = "24px Arial";
        // ctx.fillText("Player " + currentPlayerTurn, (gameEngine.surfaceWidth / 2) - (50), 30);
        // ctx.globalAlpha = 1;     
    }

    // Selected Region Highlight
    if (selectedRegion != null && selectedRegion != 0 && selectedRegion != -1
        && gameEngine.GUIEntities[3].destinationSelectCaptain != undefined && !gameEngine.GUIEntities[3].destinationSelectCaptain
        && gameEngine.GUIEntities[3].destinationSelect != null && !gameEngine.GUIEntities[3].destinationSelect) {
        // console.log("selectedRegion");
        // console.log(selectedRegion);

        ctx.strokeStyle = '#00ff15';
        ctx.lineWidth = 6;
        highlightRegion(ctx, selectedRegion);
    }
    else if (selectedRegion != null && (gameEngine.GUIEntities[3].destinationSelectCaptain != undefined || gameEngine.GUIEntities[3].destinationSelectCaptain)
        && (gameEngine.GUIEntities[3].destinationSelect != null || gameEngine.GUIEntities[3].destinationSelect)) {

        ctx.strokeStyle = '#00ff15';
        ctx.lineWidth = 6;
        highlightRegion(ctx, selectedRegion);


        // console.log(selectedRegion)
        for (var i = 0; i < selectedRegion.neighbors.length; i++) {
            if (regionsList[selectedRegion.neighbors[i]].owner == currentPlayerTurn
                || regionsList[selectedRegion.neighbors[i]].owner == -1) {
                ctx.strokeStyle = 'blue';
            } else {
                ctx.strokeStyle = 'red';
            }

            // console.log(selectedRegion.neighbors)
            highlightRegion(ctx, regionsList[selectedRegion.neighbors[i]])
        }
    }


}

function highlightRegion(ctx, region) {
    if (region != null) {

        ctx.beginPath();
        ctx.moveTo(((region.outline[0][0] + 1) * dim) - (cameraOrigin.x * dim),
            ((region.outline[0][1] + 1) * dim) - (cameraOrigin.y * dim));

        for (var i = 1; i < region.outline.length; i++) {
            ctx.lineTo(((region.outline[i][0] + 1) * dim) - (cameraOrigin.x * dim),
                ((region.outline[i][1] + 1) * dim) - (cameraOrigin.y * dim));
        }

        ctx.lineTo(((region.outline[0][0] + 1) * dim) - (cameraOrigin.x * dim),
            ((region.outline[0][1] + 1) * dim) - (cameraOrigin.y * dim));
        ctx.stroke();
    }

}

function fillRegion(ctx, region) {
    if (region != null) {

        ctx.beginPath();
        ctx.moveTo(((region.outline[0][0] + 1) * dim) - (cameraOrigin.x * dim),
            ((region.outline[0][1] + 1) * dim) - (cameraOrigin.y * dim));

        for (var i = 1; i < region.outline.length; i++) {
            ctx.lineTo(((region.outline[i][0] + 1) * dim) - (cameraOrigin.x * dim),
                ((region.outline[i][1] + 1) * dim) - (cameraOrigin.y * dim));
        }

        ctx.lineTo(((region.outline[0][0] + 1) * dim) - (cameraOrigin.x * dim),
            ((region.outline[0][1] + 1) * dim) - (cameraOrigin.y * dim));
        ctx.fill();
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
            if (debug) console.log("triggered 2");
        }
        if (Number(yTranslationToMap) >= Number(this.yMax)) {
            yTranslationToMap = this.yMax;
            if (debug) console.log("triggered 3");
        }
        if (Number(yTranslationToMap) <= 0) {
            yTranslationToMap = 0;
            if (debug) console.log("triggered 4");

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
    ctx.lineWidth = 1;
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
    this.archerIconOn = AM.getAsset("./img/control/archer_on.png")
    this.archerIconOff = AM.getAsset("./img/control/archer_off.png")

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
    this.t_arcBtn = { x: w - this.btnDim * 4, y: h - this.btnDim * 2 };
    this.b_farmBtn = { x: w - this.btnDim * 2, y: h - this.btnDim * 2 };
    this.b_barBtn = { x: w - this.btnDim * 3, y: h - this.btnDim * 2 };

    this.menu = [{ name: "action", x: this.aBtn.x, y: this.aBtn.y, w: this.btnDim, h: this.btnDim },
    { name: "troop", x: this.tBtn.x, y: this.tBtn.y, w: this.btnDim, h: this.btnDim },
    { name: "building", x: this.bBtn.x, y: this.bBtn.y, w: this.btnDim, h: this.btnDim },
    { name: "endTurn", x: this.eTBtn.x, y: this.eTBtn.y, w: this.btnDim, h: this.btnDim }];

    this.actionMenu = [{ name: "moveCap", x: this.a_capBtn.x, y: this.a_capBtn.y, w: this.btnDim, h: this.btnDim },
    { name: "moveFight", x: this.a_moveBtn.x, y: this.a_moveBtn.y, w: this.btnDim, h: this.btnDim }];

    this.troopMenu = [{ name: "troop1", x: this.t_infBtn.x, y: this.t_infBtn.y, w: this.btnDim, h: this.btnDim },
    { name: "troop2", x: this.t_arcBtn.x, y: this.t_arcBtn.y, w: this.btnDim, h: this.btnDim }];

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
    this.endTurnActive = true;

    // Sub-menu On/Off boolean
    this.moveActive = false;
    this.capActive = false;
    this.soldierActive = false;
    this.archerActive = false;
    this.barracksActive = false;
    this.farmActive = false;


    //Hover mega menu
    this.actionHover = false;
    this.troopHover = false;
    this.buildingHover = false;
    this.endHover = false;

    //Sub menu
    this.moveHover = false;
    this.capHover = false;
    this.soldierHover = false;
    this.archerHover = false;
    this.barracksHover = false;
    this.farmHover = false;

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
        if (selectedRegion != null && selectedRegion.owner != (turnCount % 2)) {
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
    this.currentRegion = selectedRegion;

    // Captain flag
    if (selectedRegion != null && selectedRegion.cap != null && selectedRegion.cap.hasMoved == false) {
        this.capActive = true;
    } else {
        this.capActive = false;
    }

    // Move flag
    if (selectedRegion != null &&
        ((selectedRegion.troop["soldier"] != null && selectedRegion.troop["soldier"].hasMoved != selectedRegion.troop["soldier"].count) ||
            (selectedRegion.troop["soldierRanged"] != null && selectedRegion.troop["soldierRanged"].hasMoved != selectedRegion.troop["soldierRanged"].count))) {
        this.moveActive = true;
    } else {
        this.moveActive = false;
    }

    // Soldier flag
    if (selectedRegion != null && selectedRegion.bldg["barracks"] != null &&
        players[currentPlayerTurn].foodCount >= (new Soldier(gameEngine, 0, 0).cost)) {
        this.soldierActive = true;
        this.archerActive = true;
    } else {
        this.soldierActive = false;
        this.archerActive = false;
    }

    // Barracks flag
    if (selectedRegion != null && selectedRegion.bldg["barracks"] == null &&
        players[currentPlayerTurn].goldCount >= (new Barracks(gameEngine, 0, 0, 0).cost)) {
        this.barracksActive = true
    } else {
        this.barracksActive = false;
    }

    // Farm flag
    if (selectedRegion != null && selectedRegion.bldg["farm"] == null &&
        players[currentPlayerTurn].goldCount >= (new Farm(gameEngine, 0, 0, 0).cost)) {
        this.farmActive = true;
    } else {
        this.farmActive = false;
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
        // this.moveDestination = selectedRegion;
        var regionFound = false;
        console.log("this.moveDestination")
        console.log(this.moveDestination)
        // Check for neighbors
        if (this.moveDestination != null) {
            for (var i = 0; i < this.moveDestination.neighbors.length; i++) {
                if (this.moveDestination.neighbors[i] == this.moveSource.id) {
                    regionFound = true;
                }
            }
        }

        // If region is a neighbor, we can moveFight
        if (regionFound) {
            console.log("move fight triggered")
            moveFight(this.moveSource, this.moveDestination);
            // console.log("HELLLO!")
            // console.log(selectedRegion)
            selectedRegion = null;
            // console.log("HELLLO!222")
            // console.log(selectedRegion)
        } else {
            selectedRegion = null;
        }


        this.destinationSelect = false;
        this.moveDelay = false;
        this.moveDestination = null;
        this.moveSource = null;
    }

    // console.log(selectedRegion)
    if (this.moveDelay && this.destinationSelectCaptain) {
        // this.moveDestination = selectedRegion;
        var regionFound = false;

        // Check for neighbors
        if (this.moveDestination != null) {
            for (var i = 0; i < this.moveDestination.neighbors.length; i++) {
                if (this.moveDestination.neighbors[i] == this.moveSource.id) {
                    regionFound = true;
                }
            }
        }

        // If region is a neighbor, we can moveFight
        if (regionFound) {
            moveCap(this.moveSource, this.moveDestination);
            // console.log("HELLLO!")
            // console.log(selectedRegion)
            selectedRegion = null;
            // console.log("HELLLO!222")
            // console.log(selectedRegion)
        } else {
            selectedRegion = null;
        }


        this.destinationSelectCaptain = false;
        this.moveDelay = false;
        this.moveDestination = null;
        this.moveSource = null;




        // console.log("Hello")
        // this.moveDestination = selectedRegion;
        // moveCap(this.moveSource, this.moveDestination)
        // this.destinationSelect = false;
        // this.moveDelay = false;
        // this.moveSource = null;
        // this.moveDestination = null;
    }


    // Sub-menu for Action Button
    if (click != null && this.actionFlag == true &&
        click.x >= this.a_capBtn.x &&
        click.y >= this.a_capBtn.y &&
        click.x <= (this.a_moveBtn.x + this.btnDim) &&
        click.y <= (this.a_moveBtn.y + this.btnDim)) {
        var actionItem = getClickedItem(this.actionMenu, click.x, click.y);

        if (actionItem != null) {

            console.log()
            if (this.moveActive == true && actionItem.name == "moveFight") {
                this.destinationSelectCaptain = false;
                this.destinationSelect = true;
                this.moveSource = selectedRegion;
                console.log("pre click -- " + this.moveSource.id)

            }
            else if (this.capActive == true && actionItem.name == "moveCap") {
                this.destinationSelect = false;
                this.destinationSelectCaptain = true;
                this.moveSource = selectedRegion;
            }
        }
        gameEngine.click = null;
        toggleAllOff();
    }


    // Sub-menu for Troop Button
    if (click != null && this.troopFlag == true &&
        click.x >= this.t_arcBtn.x &&
        click.y >= this.t_arcBtn.y &&
        click.x <= (this.t_infBtn.x + this.btnDim) &&
        click.y <= (this.t_infBtn.y + this.btnDim)) {
        var troopItem = getClickedItem(this.troopMenu, click.x, click.y);
        if (troopItem != null) {
            if (this.soldierActive == true && troopItem.name == "troop1") {
                this.destinationSelectCaptain = false;
                this.destinationSelect = false;
                var source = selectedRegion;
                buildSoldier(source);
            }
            if (this.soldierActive == true && troopItem.name == "troop2") {
                this.destinationSelectCaptain = false;
                this.destinationSelect = false;
                var source = selectedRegion;
                buildSoldierRanged(source);
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
                this.destinationSelectCaptain = false;
                this.destinationSelect = false;
                var source = selectedRegion;
                buildFarm(source);

            } else if (this.barracksActive == true && buildingItem.name == "barracks") {
                this.destinationSelectCaptain = false;
                this.destinationSelect = false;
                var source = selectedRegion;
                buildBarracks(source);
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
                this.destinationSelectCaptain = false;
                this.destinationSelect = false;
                // Ryan's function goes here
                selectedRegion = null;
                toggleTurn();


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
        toggleAllToolTipOff();
    }

    function toggleAllToolTipOff() {
        that.actionHover = false;
        that.troopHover = false;
        that.buildingHover = false;
        that.endHover = false;
        that.moveHover = false;
        that.capHover = false;
        that.soldierHover = false;
        that.archerHover = false;
        that.farmHover = false;
        that.barracksHover = false;
    }

    function toggleMegaToolTipOff() {
        that.actionHover = false;
        that.troopHover = false;
        that.buildingHover = false;
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

    if (gameEngine.mouseOver != null && this.actionFlag &&
        gameEngine.mouseOver.layerX >= this.a_capBtn.x &&
        gameEngine.mouseOver.layerY >= this.a_capBtn.y &&
        gameEngine.mouseOver.layerX <= (this.a_capBtn.x + (this.btnDim * 2)) &&
        gameEngine.mouseOver.layerY <= (this.a_capBtn.y + this.btnDim)) {
        var temp = getClickedItem(this.actionMenu, gameEngine.mouseOver.layerX, gameEngine.mouseOver.layerY);
        toggleMegaToolTipOff();
        // Submenu
        if (temp != null && temp.name == "moveFight") {
            this.moveHover = true;
        } else {
            this.moveHover = false;
        }
        if (temp != null && temp.name == "moveCap") {
            this.capHover = true;
        } else {
            this.capHover = false;
        }
        gameEngine.mouseOver = null;
    }

    if (gameEngine.mouseOver != null && this.troopFlag &&
        gameEngine.mouseOver.layerX >= this.t_arcBtn.x &&
        gameEngine.mouseOver.layerY >= this.t_arcBtn.y &&
        gameEngine.mouseOver.layerX <= (this.t_arcBtn.x + (this.btnDim * 2)) &&
        gameEngine.mouseOver.layerY <= (this.t_arcBtn.y + this.btnDim)) {
        var temp = getClickedItem(this.troopMenu, gameEngine.mouseOver.layerX, gameEngine.mouseOver.layerY);
        toggleMegaToolTipOff();
        // Submenu
        if (temp != null && temp.name == "troop1") {
            this.soldierHover = true;
        } else {
            this.soldierHover = false;
        }
        if (temp != null && temp.name == "troop2") {
            this.archerHover = true;
        } else {
            this.archerHover = false;
        }
        gameEngine.mouseOver = null;
    }

    if (gameEngine.mouseOver != null && this.buildingFlag &&
        gameEngine.mouseOver.layerX >= this.b_barBtn.x &&
        gameEngine.mouseOver.layerY >= this.b_barBtn.y &&
        gameEngine.mouseOver.layerX <= (this.b_barBtn.x + (this.btnDim * 2)) &&
        gameEngine.mouseOver.layerY <= (this.b_barBtn.y + this.btnDim)) {
        var temp = getClickedItem(this.buildingMenu, gameEngine.mouseOver.layerX, gameEngine.mouseOver.layerY);
        toggleMegaToolTipOff();
        // Submenu
        if (temp != null && temp.name == "farm") {
            this.farmHover = true;
        } else {
            this.farmHover = false;
        }
        if (temp != null && temp.name == "barracks") {
            this.barracksHover = true;

        } else {
            this.barracksHover = false;
        }
        gameEngine.mouseOver = null;
    }

    // Mouse over for mega menu
    if (gameEngine.mouseOver != null &&
        gameEngine.mouseOver.layerX >= this.aBtn.x &&
        gameEngine.mouseOver.layerY >= this.aBtn.y &&
        gameEngine.mouseOver.layerX <= gameEngine.surfaceWidth &&
        gameEngine.mouseOver.layerY <= gameEngine.surfaceHeight) {
        var temp = getClickedItem(this.menu, gameEngine.mouseOver.layerX, gameEngine.mouseOver.layerY);
        toggleAllToolTipOff();
        // console.log(temp)
        if (temp != null && temp.name == "action") {
            this.actionHover = true;
        } else {
            this.actionHover = false;
        }
        if (temp != null && temp.name == "building") {
            this.buildingHover = true;
        }
        else {
            this.buildingHover = false;
        }
        if (temp != null && temp.name == "troop") {
            this.troopHover = true;
        } else {
            this.troopHover = false;
        }
        if (temp != null && temp.name == "endTurn") {
            this.endHover = true;
        } else {
            this.endHover = false;
        }
        gameEngine.mouseOver = null;
    }

    if (gameEngine.mouseOver != null) {
        toggleAllToolTipOff();
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
        if (this.capActive) {
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
        if (this.archerActive) {
            ctx.drawImage(this.buttonIcon, this.t_arcBtn.x, this.t_arcBtn.y, this.btnDim, this.btnDim);
            ctx.drawImage(this.archerIconOn, this.t_arcBtn.x + 10, this.t_arcBtn.y + 10, this.btnDim - 20, this.btnDim - 20);

        } else {
            ctx.drawImage(this.buttonIcon, this.t_arcBtn.x, this.t_arcBtn.y, this.btnDim, this.btnDim);
            ctx.drawImage(this.archerIconOff, this.t_arcBtn.x + 10, this.t_arcBtn.y + 10, this.btnDim - 20, this.btnDim - 20);

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

    if (this.actionHover) {
        displayTooltip("Action", this.aBtn.x, this.aBtn.y, 100, 35)
    }

    if (this.troopHover) {
        displayTooltip("Build Troops", this.tBtn.x, this.tBtn.y, 160, 35)
    }

    if (this.buildingHover) {
        displayTooltip("Build Buildings", this.bBtn.x, this.bBtn.y, 185, 35)
    }

    if (this.endHover) {
        displayTooltip("End Turn", this.eTBtn.x, this.eTBtn.y, 125, 35)
    }

    if (this.moveHover) {
        displayTooltip("Move/Fight", this.a_moveBtn.x, this.a_moveBtn.y, 145, 35)
    }

    if (this.capHover) {
        displayTooltip("Move Captain", this.a_capBtn.x, this.a_capBtn.y, 175, 35)
    }

    if (this.soldierHover) {
        displayTooltip("Build Melee (3 Food)", this.t_infBtn.x, this.t_infBtn.y, 252, 35)
    }

    if (this.archerHover) {
        displayTooltip("Build Ranged (3 Food)", this.t_arcBtn.x, this.t_arcBtn.y, 270, 35)
    }

    if (this.farmHover) {
        displayTooltip("Build Farm (8 gold)", this.b_farmBtn.x - 30, this.b_farmBtn.y, 232, 35)
    }

    if (this.barracksHover) {
        displayTooltip("Build Barracks (8 gold)", this.b_barBtn.x - 30, this.b_barBtn.y, 268, 35)
    }

    function displayTooltip(text, x, y, w, h) {
        ctx.font = "24px Arial";
        ctx.fillStyle = "#222"
        ctx.fillRect(x - 50, y - 35, w, h);
        ctx.fillStyle = '#bada55';
        ctx.fillText(text, x - 35, y - 10)
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
InputHandler.prototype.constructor = InputHandler;

InputHandler.prototype.update = function (ctx) {
    // console.log(regionsList)
    // console.log("%c Current Region:", "background: #222; color: #bada55");
    // console.log(selectedRegion);
    // console.log("%c All Region:", "background: #222; color: #bada55");
    // console.log(regionsList);
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


    // console.log(selectedRegion)
    // Control clicks on the map
    var click = gameEngine.click;
    if (click != null) {

        var tempRegion = getClickedRegion(onScreenRegions, click.x, click.y);

        if (tempRegion != null &&
            ((gameEngine.GUIEntities[3].destinationSelect ||
                gameEngine.GUIEntities[3].destinationSelectCaptain))) {
            //if (selectedRegion != null) setSpritesToUnselected(selectedRegion);

            gameEngine.GUIEntities[3].moveDestination = tempRegion;
            // selectedRegion = null;
            // setSpritesToSelected(selectedRegion);
        } else if (tempRegion != null &&
            (tempRegion.owner == currentPlayerTurn)) {
            //if (selectedRegion != null) setSpritesToUnselected(selectedRegion);
            selectedRegion = tempRegion;
        } else {
            selectedRegion = null;
        }


        console.log("%c Clicked Region Below this:", "background: #222; color: #bada55");
        console.log(selectedRegion);

        // console.log(gameEngine.GUIEntities[2].moveDelay)
        // console.log(gameEngine.GUIEntities[2].destinationSelect)

        if (gameEngine.GUIEntities[3].destinationSelect || gameEngine.GUIEntities[3].destinationSelectCaptain) {

            gameEngine.GUIEntities[3].moveDelay = true;
            // console.log("movedelay after moveDelay set " + gameEngine.GUIEntities[2].moveDelay)
        }


        // console.log("%c Region clicked below this:", "background: #222; color: #bada55");
        // console.log(click);
        // console.log(selectedRegion);
        // console.log("True Location --- " + (Number(dim * cameraOrigin.x) + Number(click.x)) + ", " +
        //     (Number(dim * cameraOrigin.y) + Number(click.y)));


        // var text = "[" + (Number(dim * cameraOrigin.x) + Number(click.x)) + ", " +
        //     (Number(dim * cameraOrigin.y) + Number(click.y)) + "]";
        // navigator.clipboard.writeText(text).then(function () {
        //     // console.log('Async: Copying to clipboard was successful!');
        // }, function (err) {
        //     // console.error('Async: Could not copy text: ', err);
        // });


        var text = "[" + (Number(click.x)) + ", " +
            (Number(click.y)) + "]";
        navigator.clipboard.writeText(text).then(function () {
            // console.log('Async: Copying to clipboard was successful!');
        }, function (err) {
            // console.error('Async: Could not copy text: ', err);
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
    // audio.play();
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
// Start - Fog of War
// ===================================================================
function FogOfWar(game) {

    this.displays = new Set();
    GUIEntity.call(this, game, 0, 0);
}

FogOfWar.prototype = new GUIEntity();
FogOfWar.prototype.constructor = FogOfWar;

FogOfWar.prototype.update = function (ctx) {

}

function getFogOfWar() {
    var output = new Set();
    // gameEngine.GUIEntities[0].displays = new Set();
    for (var i = 0; i < onScreenRegions.length; i++) {
        for (var j = 0; j < onScreenRegions[i].length; j++) {


            if (onScreenRegions[i][j] != null &&
                regionsList[onScreenRegions[i][j].name] != null &&
                regionsList[onScreenRegions[i][j].name].owner != currentPlayerTurn) {
                // console.log("ADDING" + onScreenRegions[i][j].name)
                output.add(onScreenRegions[i][j].name);
            }

        }
    }

    for (var i = 0; i < onScreenRegions.length; i++) {
        for (var j = 0; j < onScreenRegions[i].length; j++) {

            if (onScreenRegions[i][j] != null &&
                regionsList[onScreenRegions[i][j].name] != null &&
                regionsList[onScreenRegions[i][j].name].owner == currentPlayerTurn) {

                for (var k = 0; k < regionsList[onScreenRegions[i][j].name].neighbors.length; k++) {
                    output.delete(regionsList[onScreenRegions[i][j].name].neighbors[k]);

                    // console.log("DELETING" + regionsList[onScreenRegions[i][j].name].neighbors[k])
                }


            }
        }
    }

    // for (var i = 0; i < regionsList.length; i++) {
    //     if (regionsList[i] != null && regionsList[i].owner != currentPlayerTurn) {
    //         output.add(i);
    //     }
    // }

    // this.displays = output;

    return output;
}

FogOfWar.prototype.draw = function (ctx) {
    // console.log(Object.keys(this.displays).length)
    // console.log(this.displays.size)

    // for (var i = 0; i < this.displays.size; i++) {
    //     // console.log("FOG OF WAR")
    //     console.log(regionsList[this.displays[i]);
    //     highlightRegion(ctx, regionsList[this.displays[i]]);
    //     // ctx.drawImage(this.fow[displays[i]], this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim))
    // }



    //  this.displays.forEach((element) => 
    //             ctx.drawImage(this.fow[element], this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim)));

    ctx.fillStyle = "black";
    this.displays.forEach((element) =>
        fillRegion(ctx, regionsList[element]));


    // for (var i = 0; i < onScreenRegions.length; i++) {
    //     for (var j = 0; j < onScreenRegions[i].length; j++) {
    //         if (onScreenRegions[i][j] != null &&
    //             regionsList[onScreenRegions[i][j].name] != null &&
    //             regionsList[onScreenRegions[i][j].name].owner != currentPlayerTurn) {
    //             ctx.drawImage(this.fow[onScreenRegions[i][j].name],
    //                 this.x - (cameraOrigin.x * dim),
    //                 this.y - (cameraOrigin.y * dim));
    //         }
    //     }
    // }

}
// ===================================================================
// End - Fog of War
// ===================================================================



// ===================================================================
// Start - Welcome Screen
// ===================================================================

function WelcomeScreen(game) {
    // Welcome Screen Background
    this.animation = new Animation(AM.getAsset("./img/welcome_screen.png"), 1280, 720, 8960, .9, 7, true, 1);

    this.newGame = AM.getAsset("./img/new_game.png");
    this.newGameHighlighted = AM.getAsset("./img/new_game_highlighted.png");
    this.instructions = AM.getAsset("./img/instructions.png");
    this.instructionsHighlighted = AM.getAsset("./img/instructions_highlighted.png");

    this.insPageOne = AM.getAsset("./img/ins_control.png");
    this.insPageTwo = AM.getAsset("./img/ins_play.png");


    this.insFlag = false;

    this.display = this.insPageOne;

    this.ngDisplay = this.newGame;
    this.insDisplay = this.instructions;
    this.ctx = game.ctx;

    // New Game Button Paramters
    this.ngWidth = 172;
    this.ngHeight = 40;
    this.ngX = (gameEngine.surfaceWidth / 2) - (this.ngWidth / 2); //This is to center the button
    this.ngY = 500; //Y-coordinate of button

    // Instructions Button Paramters
    this.insWidth = 197;
    this.insHeight = 40;
    this.insX = (gameEngine.surfaceWidth / 2) - (this.insWidth / 2); //This is to center the button
    this.insY = 580; //Y-coordinate of button

    // Hitboxes for the buttons
    this.hitBoxes = [{ name: "newGame", x: this.ngX + 3, y: this.ngY + 3, w: this.ngWidth - 3, h: this.ngHeight - 3 },
    { name: "instructions", x: this.insX + 3, y: this.insY + 3, w: this.insWidth - 3, h: this.insHeight - 3 }];


    this.insHitBoxes = [{ name: "previous", x: 200, y: 627, w: 85, h: 50 },
    { name: "next", x: 1017, y: 632, w: 85, h: 50 },
    { name: "home", x: 989, y: 48, w: 70, h: 50 }];


    this.audio = new Audio("./sound/welcome_music.mp3");
    this.audio.autoplay = true;
    this.audio.play();

    Entity.call(this, game, 0, 0);
}

WelcomeScreen.prototype = new Entity();
WelcomeScreen.prototype.constructor = WelcomeScreen;

WelcomeScreen.prototype.update = function (ctx) {

    var that = this;
    // Hover actions
    if (gameEngine.mouseOver != null) {
        var temp = getClickedItem(this.hitBoxes, gameEngine.mouseOver.layerX, gameEngine.mouseOver.layerY);
        // console.log(temp);
        if (temp != null && temp.name === "newGame") {
            this.ngDisplay = this.newGameHighlighted;
        } else {
            this.ngDisplay = this.newGame;
        }

        if (temp != null && temp.name === "instructions") {
            this.insDisplay = this.instructionsHighlighted;
        } else {
            this.insDisplay = this.instructions;
        }
        gameEngine.mouseOver = null;
    }




    if (gameEngine.click != null && this.insFlag) {
        var clicked = getClickedItem(this.insHitBoxes, gameEngine.click.x, gameEngine.click.y);
        console.log(clicked)
        if (clicked != null && clicked.name === "previous") {
            togglePage();
        }
        if (clicked != null && clicked.name === "next") {
            togglePage();
        }
        if (clicked != null && clicked.name === "home") {
            this.insFlag = false;
        }
        gameEngine.click = null;
    }

    // Click actions
    if (gameEngine.click != null) {

        // var text = "[" + (Number(dim * cameraOrigin.x) + Number(gameEngine.click.x)) + ", " +
        //     (Number(dim * cameraOrigin.y) + Number(gameEngine.click.y)) + "]";
        // navigator.clipboard.writeText(text).then(function () {
        //     // console.log('Async: Copying to clipboard was successful!');
        // }, function (err) {
        //     // console.error('Async: Could not copy text: ', err);
        // });
        var hit = getClickedItem(this.hitBoxes, gameEngine.click.x, gameEngine.click.y);

        if (debug) {
            console.log(gameEngine.click);
            console.log(this.hitBoxes);
            console.log(hit);
        }

        if (hit != null && hit.name === "newGame") {
            gameEngine.newGame = true;
        }
        if (hit != null && hit.name === "instructions") {
            this.insFlag = true;

        }
        gameEngine.click = null;
    }



    if (gameEngine.newGame) {
        this.removeFromWorld = true;
        gameEngine.addEntity(new MapDisplay(gameEngine));
        if (toggleFogOfWar) {
            gameEngine.addGUIEntity(new FogOfWar(gameEngine));
        } else {
            gameEngine.addGUIEntity(new GUIEntity());
        }

        gameEngine.addGUIEntity(new MinimapDisplay(gameEngine));
        gameEngine.addGUIEntity(new StatDisplay(gameEngine));

        gameEngine.addGUIEntity(new ControlDisplay(gameEngine));

        gameEngine.addGUIEntity(new ResourceDisplay(gameEngine));
        gameEngine.addGUIEntity(new EndResultDisplay(gameEngine));
        // gameEngine.addGUIEntity(new FogOfWar(gameEngine));


        gameEngine.addEntity(new InputHandler(gameEngine));
        gameEngine.addEntity(new AudioHandler(gameEngine));


        // Initial player values
        changeCameraOrigin(59, 0);
        createArray(cameraOrigin);
        players.push(new Player(0, 0, { x: 59, y: 0 }));
        players[0].foodCount = 147;
        players[0].goldCount = 352;
        // players[0].foodCount = 999;
        players.push(new Player(1, 0, { x: 0, y: 90 }));
        players[1].foodCount = 15;

        // Start buildings, troops
        for (var i = 0; i < regionsList.length; i++) {
            if (regionsList[i] != undefined) {
                if ((i >= 40 && i <= 50) || (i >= 29 && i <= 39)) {
                    buildSoldier(regionsList[i]);
                    regionsList[i].troop["soldier"].hasMoved = 0;
                    buildSoldierRanged(regionsList[i]);
                    regionsList[i].troop["soldierRanged"].hasMoved = 0;

                    updateFlag(regionsList[i]);

                    buildFarm(regionsList[i]);
                    buildBarracks(regionsList[i]);
                }

            }
        }

        // gameEngine.GUIEntities[5].displayBattle(0);
        // Tester
        // for (var i = 0; i < regionsList.length; i++) {
        //     if (regionsList[i] != undefined) {

        //         buildSoldier(regionsList[i]);
        //         regionsList[i].troop["soldier"].hasMoved = 0;
        //         buildSoldierRanged(regionsList[i]);
        //         // regionsList[i].troop["soldierRanged"].hasMoved = 0;
        //         buildFarm(regionsList[i]);
        //         buildBarracks(regionsList[i]);
        //         addCaptainToRegion(regionsList[i]);


        //     }
        // }

        // Start captains
        addCaptainToRegion(regionsList[43]);
        addCaptainToRegion(regionsList[31]);



        // gameEngine.addEntity(new Alien(gameEngine, 300, 250));

    }



    function togglePage() {
        if (that.display == that.insPageOne) {
            that.display = that.insPageTwo;

        } else {
            that.display = that.insPageOne;

        }
    }
}

WelcomeScreen.prototype.draw = function (ctx) {

    // ctx.drawImage(this.newGameButton, this.ngbX, this.ngbY, this.ngbWidth, this.ngbHeight);


    if (this.insFlag) {
        ctx.drawImage(this.display, 0, 0);
    } else {
        this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        ctx.drawImage(this.ngDisplay, this.ngX, this.ngY);
        ctx.drawImage(this.insDisplay, this.insX, this.insY);
    }

}
// ===================================================================
// End - Welcome SCreen
// ===================================================================


// ===================================================================
// Start - End Result Display Screen
// ===================================================================

function EndResultDisplay(game) {
    // Welcome Screen Background
    //this.animation = new Animation(AM.getAsset("./img/welcome_screen.png"), 1280, 720, 8960, .9, 7, true, 1);

    this.sword = new Animation(AM.getAsset("./img/swords_animated.png"), 187, 128, 1307, 0.25, 7, false, 1);
    this.paper = AM.getAsset("./img/result_paper.png")
    this.continueBtn = AM.getAsset("./img/continue_button.png")

    this.isContinue = false;
    this.numberOfBattles = 0;
    this.displayBattleText = false;

    this.displayBattle = function (numBattle) {
        this.numberOfBattles = numBattle;
        this.displayBattleText = true;
    }


    // Hitboxes for the buttons
    this.hitBox = [{ name: "continue", x: 533, y: 449, w: 211, h: 49 }];

    GUIEntity.call(this, game, 0, 0);
}

EndResultDisplay.prototype = new GUIEntity();
EndResultDisplay.prototype.constructor = EndResultDisplay;

EndResultDisplay.prototype.update = function () {
    if (gameEngine.click != null && displayEnd) {
        var clicked = getClickedItem(this.hitBox, gameEngine.click.x, gameEngine.click.y);
        if (clicked != null && clicked.name == "continue") {
            this.isContinue = true;
        }
        displayEnd = false;
        this.isContinue = false;
        gameEngine.click = null
        this.displayBattleText = false;
    }



}

EndResultDisplay.prototype.draw = function (ctx) {

    if (!this.isContinue && displayEnd) {

        ctx.drawImage(this.paper, (gameEngine.surfaceWidth / 2) - (300), (gameEngine.surfaceHeight / 2) - (150));

        this.sword.drawFrame(this.game.clockTick, ctx, (gameEngine.surfaceWidth / 2) - (187 / 2), 180);
        ctx.font = "24px Arial";
        ctx.fillText("End Turn Report", (gameEngine.surfaceWidth / 2) - (92),
            (gameEngine.surfaceHeight / 2) - (30))
        ctx.drawImage(this.continueBtn, (gameEngine.surfaceWidth / 2) - (109), 450);

    }

    if (this.displayBattleText) {
        ctx.font = "24px Arial";
        if (this.numberOfBattles > 0) {
            ctx.fillText("Number of Alien Activity: " + this.numberOfBattles, (gameEngine.surfaceWidth / 2) - (130),
                390)
        } else {
            ctx.fillText("No activity to report.", (gameEngine.surfaceWidth / 2) - (110),
                390)
        }

    }


}


// ===================================================================
// End - End Result Display SCreen
// ===================================================================







// ===================================================================
// Start - Main
// ===================================================================
function Main() {
    // Resource Display
    AM.queueDownload("./img/sidebar/resource_display.png");
    AM.queueDownload("./img/sidebar/food_icon.png");
    AM.queueDownload("./img/sidebar/gold_icon.png");

    // Stat Display
    AM.queueDownload("./img/sidebar/stat_display.png");
    AM.queueDownload("./img/hide_stat.png");
    AM.queueDownload("./img/show_stat.png");

    // Game Map Display
    AM.queueDownload("./img/map/map_master4.png");

    // Combat Entities 
    AM.queueDownload("./img/sprites/alien_animated.png");
    AM.queueDownload("./img/sprites/alien_standing.png");
    AM.queueDownload("./img/sprites/soldier_standing.png");
    AM.queueDownload("./img/sprites/soldier_animated.png");
    AM.queueDownload("./img/sprites/alien_ranged_animated.png");
    AM.queueDownload("./img/sprites/alien_ranged_standing.png");
    AM.queueDownload("./img/sprites/soldier_ranged_standing.png");
    AM.queueDownload("./img/sprites/soldier_ranged_animated.png");
    AM.queueDownload("./img/sprites/cap_alien_animated.png");
    AM.queueDownload("./img/sprites/cap_alien_standing.png");
    AM.queueDownload("./img/sprites/cap_soldier_standing.png");
    AM.queueDownload("./img/sprites/cap_soldier_animated.png");

    AM.queueDownload("./img/sprites/red_flag_animated.png");
    AM.queueDownload("./img/sprites/red_flag_standing.png");
    AM.queueDownload("./img/sprites/blue_flag_standing.png");
    AM.queueDownload("./img/sprites/blue_flag_animated.png");


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

    AM.queueDownload("./img/new_game_highlighted.png");
    AM.queueDownload("./img/new_game.png");
    AM.queueDownload("./img/instructions_highlighted.png");
    AM.queueDownload("./img/instructions.png");

    AM.queueDownload("./img/ins_control.png");
    AM.queueDownload("./img/ins_play.png");

    // End Turn Display
    AM.queueDownload("./img/swords_animated.png");
    AM.queueDownload("./img/result_paper.png");
    AM.queueDownload("./img/continue_button.png");

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
    AM.queueDownload("./img/control/archer_on.png");
    AM.queueDownload("./img/control/archer_off.png");


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