// === START OF BOILERPLATE CODE ===
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
// === END OF BOILERPLATE CODE ===


//Global variables
var myCells = [[], []]; // Tile grid
var myRegions = []; // Contains IDs of tiles per region
var myCanvasSize;

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}



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
 * @param {int} atk attack value of the building
 * @param {int} def defense value of the building
 * @param {int} cost cost value of the building
 */
function Building(name, atk, def, cost) {
    this.name = name,
        this.atk = atk,
        this.def = def,
        this.cost = cost
}

/**
 * Creates a region in the game.
 * 
 * @param {String} name name of the region (Name must be unique)
 * @param {Boolean} bldg true if barracks is present else false
 * @param {int} owner 1 = not owned, 0 = player owned, 1 = enemy owned
 * @param {int} troopX X coordinate of unit
 * @param {int} troopY Y coordinate of unit
 * @param {int} bldgX X coordinnate of bldg
 * @param {int} bldgY Y coordinate of bldg
 * @param {int} territory ID of territory this 
 * @param {Stringp[]} neighbors Array of region names which neighbors (1 move cost) this region
 * @param {*} troopCount number of troops in a region, 0 if no troops
 */
function Region(name, bldg, owner, troopX, troopY, bldgX, bldgY, territory, neighbors, troopCount) {
    this.name = name,
        this.bldg = bldg,
        this.owner = owner,
        this.troopX = troopX,
        this.troopY = troopY,
        this.bldgX = bldgX,
        this.bldgY = bldgY,
        this.territory = territory,
        this.neighbors = neighbors,
        this.troopCount = troopCount
}

function LoadMap() {
    /**
     * Line 1 - Width, Height
     * Line 2 - Region Mapping - ex. Region[0] = [0,1,2], Region[1] = [3,4]
     * Comma delimited
     * Height = number of rows + 2
     * Width = # of elements per row
     */
}

function AddBuilding() {
    /**
     * Add a building to a tile
     */
}

function AddUnit(tileID) {
    /**
     * Add a unit to a tile
     */
}

/**
 * Animates the troop from source tile to destination tile.
 * This function will also check if the destination tile has enemy troops.
 * 
 * @param {Tile} theSource 
 * @param {Tile} theDestination 
 */
function MoveUnit(source, destination) {
    /**
     * Move from cell to cell
     * walking animation
     * 
     * check for opponents
     * 
     * Combat animation start
     * Battle system:
     * Attacker's atk - Defender's def
     * calculate remaining troops
     */
}

/**
 * Upgrade the building in the tile
 */
function UpgradeBuilding(tileID, buildingIndex) {
    /**
     * Animate the creation of the building (if possible)
     */
}

/**
 * Moves the number of troops designated by player from source to destination.
 * 
 * @param {Tile} source  
 * @param {Tile} destination 
 */
function SplitUnit(source, destination) {
}

/**
 * 
 * @param {*} x x-coordinate of mouse click event
 * @param {*} y y-coordinate of mouse click event
 */
function SelectCell(x, y) {
    /**
     * Check which region is selected
     * Shows Action Menu
     */
}

function EndTurn() {
    /**
     * Calculate food
     * activates the AI
     */
}

function ActivateAI() {
    /**
     * AI will decide what to do depending on variables visible to it.
     */
}

// === START OF RESOURCE DISPLAY ===
function ResourceDisplay(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

ResourceDisplay.prototype = new Entity();
ResourceDisplay.prototype.constructor = ResourceDisplay;

ResourceDisplay.prototype.update = function () {
}

ResourceDisplay.prototype.draw = function (ctx) {
    ctx.fillStyle = "#a7b0c2";
    ctx.strokeStyle = "black";
    ctx.fillRect(900, 0, 380, 50);
    ctx.strokeRect(900, 0, 380, 50);
    Entity.prototype.draw.call(this);
}

function ResourceFoodIcon(game, spritesheet) {
    this.animation = new Animation(spritesheet, 189, 230, 5, 0.10, 14, true, 1);
    this.x = 0;
    this.y = 0;
    this.speed = 100;
    this.game = game;
    this.ctx = game.ctx;
}

ResourceFoodIcon.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

ResourceFoodIcon.prototype.update = function () {
    if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14)
        this.x += this.game.clockTick * this.speed;
    if (this.x > 800) this.x = -230;
}
// === END OF RESOURCE DISPLAY ===

// === START OF BUILD DISPLAY ===
function BuildDisplay(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

BuildDisplay.prototype = new Entity();
BuildDisplay.prototype.constructor = ResourceDisplay;

BuildDisplay.prototype.update = function () {
}

BuildDisplay.prototype.draw = function (ctx) {
    ctx.fillStyle = "#7e8594";
    ctx.strokeStyle = "black";
    ctx.fillRect(900, 50, 380, 310);
    ctx.strokeRect(900, 50, 380, 310);
    Entity.prototype.draw.call(this);
}
// === END OF BUILD DISPLAY ===

// === START OF MOVE DISPLAY ===
function MoveDisplay(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

MoveDisplay.prototype = new Entity();
MoveDisplay.prototype.constructor = ResourceDisplay;

MoveDisplay.prototype.update = function () {
}

MoveDisplay.prototype.draw = function (ctx) {
    ctx.fillStyle = "#676d7a";
    ctx.strokeStyle = "black";
    ctx.fillRect(900, 360, 380, 310);
    ctx.strokeRect(900, 360, 380, 310);
    Entity.prototype.draw.call(this);
}
// === END OF MOVE DISPLAY ===

// === START OF ENDTURN DISPLAY ===
function EndTurnDisplay(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

EndTurnDisplay.prototype = new Entity();
EndTurnDisplay.prototype.constructor = ResourceDisplay;

EndTurnDisplay.prototype.update = function () {
}

EndTurnDisplay.prototype.draw = function (ctx) {
    ctx.fillStyle = "#4d525c";
    ctx.strokeStyle = "black";
    ctx.fillRect(900, 670, 380, 50);
    ctx.strokeRect(900, 670, 380, 50);
    Entity.prototype.draw.call(this);
}
// === END OF ENDTURN DISPLAY ===


/**
 * This function will be onLoad from the canvas
 */
function Main() {
    /**
     * load Welcome Sreen and button entities with onClick events
     * 
     * unload Welcome Scren onClick events
     * attach GAME onCLick events
     * attach GAME keyboard events
     * loadMap
     */
    var ASSET_MANAGER = new AssetManager();

    ASSET_MANAGER.queueDownload("./img/food_icon.png");

    ASSET_MANAGER.downloadAll(function () {
        console.log("starting up da shield");
        var canvas = document.getElementById('gameWorld');
        var ctx = canvas.getContext('2d');

        var gameEngine = new GameEngine();
        var resourceDP = new ResourceDisplay(gameEngine);
        var buildDP = new BuildDisplay(gameEngine);
        var moveDP = new MoveDisplay(gameEngine);
        var endTurnDP = new EndTurnDisplay(gameEngine);

        gameEngine.addEntity(resourceDP);
        gameEngine.addEntity(buildDP);
        gameEngine.addEntity(moveDP);
        gameEngine.addEntity(endTurnDP);

        gameEngine.init(ctx);
        gameEngine.start();
    });

}

Main();