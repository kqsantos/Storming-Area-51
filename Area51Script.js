// === START OF BOILERPLATE CODE ===
var AM = new AssetManager();

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
    this.border = AM.getAsset("./img/sidebar/resource_display.png");
    this.foodIcon = AM.getAsset("./img/sidebar/food_icon.png")
    this.foodCount = 0;
    Entity.call(this, game, 900, 0);
}

ResourceDisplay.prototype = new Entity();
ResourceDisplay.prototype.constructor =  ResourceDisplay;

ResourceDisplay.prototype.draw = function (ctx) {
    ctx.drawImage(this.border, this.x, this.y);
    ctx.drawImage(this.foodIcon, this.x+30, this.y+10);
    ctx.font = "24px Arial";
    ctx.fillText(this.foodCount, this.x+70, this.y+35);
}
// === END OF RESOURCE DISPLAY ===

// === START OF BUILD DISPLAY ===
function BuildDisplay(game) {
    this.border = AM.getAsset("./img/sidebar/build_display.png");
    Entity.call(this, game, 900, 50);
}

BuildDisplay.prototype = new Entity();
BuildDisplay.prototype.constructor =  BuildDisplay;

BuildDisplay.prototype.draw = function (ctx) {
    ctx.drawImage(this.border, this.x, this.y);
    ctx.font = "24px Arial";
    ctx.fillText("Build", this.x+30, this.y+35);
}
// === END OF BUILD DISPLAY ===

// === START OF MOVE DISPLAY ===
function MoveDisplay(game) {
    this.border = AM.getAsset("./img/sidebar/move_display.png");
    Entity.call(this, game, 900, 360);
}

MoveDisplay.prototype = new Entity();
MoveDisplay.prototype.constructor =  MoveDisplay;

MoveDisplay.prototype.draw = function (ctx) {
    ctx.drawImage(this.border, this.x, this.y);
    ctx.font = "24px Arial";
    ctx.fillText("Move/Fight", this.x+30, this.y+35);
}
// === END OF MOVE DISPLAY ===

// === START OF ENDTURN DISPLAY ===
function EndTurnDisplay(game) {
    this.border = AM.getAsset("./img/sidebar/end_turn_display.png");
    this.button = AM.getAsset("./img/sidebar/end_turn_button.png");
    Entity.call(this, game, 900, 670);
}

EndTurnDisplay.prototype = new Entity();
EndTurnDisplay.prototype.constructor =  EndTurnDisplay;

EndTurnDisplay.prototype.draw = function (ctx) {
    ctx.drawImage(this.border, this.x, this.y);
    ctx.drawImage(this.button, this.x + 117, this.y + 7);
}
// === END OF ENDTURN DISPLAY ===



///// REFACTOR ////////

//=== START OF MARINE ===
function Marine(game, spritesheet) {
    this.animation = new Animation(spritesheet, 22, 33, 3, 0.15, 3, true, 1);
    this.speed = 10;
    this.ctx = game.ctx;
    Entity.call(this, game, 0, 20);
    
}

Marine.prototype = new Entity();
Marine.prototype.constructor = Marine;

Marine.prototype.update = function () {

    this.y += this.game.clockTick * this.speed;
    if (this.y < 120) {
        this.y += 1;
        Entity.prototype.update.call(this);
    }else{
        this.y = 121;
        this.animation.frameDuration = 1;
    }
}

Marine.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}
//=== END OF MARINE ===

 
//=== START OF MARINEEAST ===
function MarineEast(game, spritesheet) {
    this.animation = new Animation(spritesheet, 22, 33, 3, 0.15, 3, true, 1);
    this.speed = 50;
    this.ctx = game.ctx;
    Entity.call(this, game, 50, 200);

}

MarineEast.prototype = new Entity();
MarineEast.prototype.constructor = MarineEast;

MarineEast.prototype.update = function () {
    this.x += this.game.clockTick * this.speed;
    if (this.x < 700) {
        this.x += 0.3;
        Entity.prototype.update.call(this);
    } else{
        this.x = 701;
        this.animation.frameDuration = 1;
    }
    
}

MarineEast.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}
//=== END OF MarineEast ===


//=== START OF HYDRALISK ===
function Hydralisk(game, spritesheet) {
    this.animation = new Animation(spritesheet, 45, 70, 3, 0.15, 3, true, 1);
    this.speed = 10;
    this.ctx = game.ctx;
    Entity.call(this, game, 0, 350);
}

Hydralisk.prototype = new Entity();
Hydralisk.prototype.constructor = Hydralisk;


Hydralisk.prototype.update = function () {
    this.x += this.game.clockTick * this.speed;
    if (this.x < 800) { 
        this.x += 0.3;
        Entity.prototype.update.call(this);
    } else{
        this.x = 801;
        this.animation.frameDuration = 1;
    }
}


Hydralisk.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}
//=== END OF HYDRALISK ===



///// REFACTOR ////////

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

    // Resource Display
    AM.queueDownload("./img/sidebar/resource_display.png");
    AM.queueDownload("./img/sidebar/food_icon.png");
    
    // Build Display
    AM.queueDownload("./img/sidebar/build_display.png");

    // Move Display
    AM.queueDownload("./img/sidebar/move_display.png");
    
    // End Turn Display
    AM.queueDownload("./img/sidebar/end_turn_display.png");
    AM.queueDownload("./img/sidebar/end_turn_button.png");
    AM.queueDownload("./img/sidebar/end_turn_button_pressed.png");

    // Animation
    AM.queueDownload("./img/Hydralisk2_east.png");
    AM.queueDownload("./img/Marine_walking_south1.png");
    AM.queueDownload("./img/Marine_walking_east1.png");
    AM.queueDownload("./img/chrono_walk.png");

    AM.downloadAll(function () {
        var canvas = document.getElementById('gameWorld');
        var ctx = canvas.getContext('2d');

        var gameEngine = new GameEngine();
        gameEngine.init(ctx);
        gameEngine.start();
        gameEngine.addEntity(new ResourceDisplay(gameEngine));
        gameEngine.addEntity(new MoveDisplay(gameEngine));
        gameEngine.addEntity(new BuildDisplay(gameEngine));
        gameEngine.addEntity(new EndTurnDisplay(gameEngine));
        gameEngine.addEntity(new Marine(gameEngine, AM.getAsset("./img/Marine_walking_south1.png")));
        gameEngine.addEntity(new MarineEast(gameEngine, AM.getAsset("./img/Marine_walking_east1.png")));
        gameEngine.addEntity(new Hydralisk(gameEngine, AM.getAsset("./img/Hydralisk2_east.png")));
    });

}

Main();