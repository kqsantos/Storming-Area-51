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

function LoadResourceDisplay(game) {
    function Background(game) {
        Entity.call(this, game, 0, 400);
        this.radius = 200;
    }

    Background.prototype = new Entity();
    Background.prototype.constructor = Background;

    Background.prototype.update = function () {
    }

    Background.prototype.draw = function (ctx) {
        ctx.fillStyle = "SaddleBrown";
        ctx.fillRect(0, 500, 800, 300);
        Entity.prototype.draw.call(this);
    }
}

function LoadBuildDisplay() {
    //var canvas = document.getElementById("gameWorld");
    //var ctx = canvas.getContext('2d');

    ctx.fillStyle = "#a7b0c2";
    ctx.strokeStyle = "black";
    ctx.fillRect(900, 0, 380, 50);
    ctx.strokeRect(900, 0, 380, 50);

    ctx.fillStyle = "#7e8594";
    ctx.strokeStyle = "black";
    ctx.fillRect(900, 50, 380, 310);
    ctx.strokeRect(900, 50, 380, 310);

    ctx.fillStyle = "#676d7a";
    ctx.strokeStyle = "black";
    ctx.fillRect(900, 360, 380, 310);
    ctx.strokeRect(900, 360, 380, 310);

    ctx.fillStyle = "#4d525c";
    ctx.strokeStyle = "black";
    ctx.fillRect(900, 670, 380, 50);
    ctx.strokeRect(900, 670, 380, 50);


    // ctx.fillStyle = "Blue";
    // ctx.strokeStyle = "Blue";
    // ctx.beginPath();
    // ctx.arc(50, 50, 25, 0, 2*Math.PI);
    // ctx.fill();
    // ctx.stroke();

    // ctx.fillStyle = "Red";
    // ctx.strokeStyle = "Red";
    // ctx.beginPath();
    // ctx.moveTo(100, 100);
    // ctx.lineTo(200, 100);
    // ctx.stroke();
}

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
        var bg = new LoadResourceDisplay(gameEngine);

        gameEngine.addEntity(bg);

        gameEngine.init(ctx);
        gameEngine.start();
    });

    //LoadBuildDisplay();
}



Main();






// function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
//     this.spriteSheet = spriteSheet;
//     this.startX = startX;
//     this.startY = startY;
//     this.frameWidth = frameWidth;
//     this.frameDuration = frameDuration;
//     this.frameHeight = frameHeight;
//     this.frames = frames;
//     this.totalTime = frameDuration * frames;
//     this.elapsedTime = 0;
//     this.loop = loop;
//     this.reverse = reverse;
// }

// Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
//     var scaleBy = scaleBy || 1;
//     this.elapsedTime += tick;
//     if (this.loop) {
//         if (this.isDone()) {
//             this.elapsedTime = 0;
//         }
//     } else if (this.isDone()) {
//         return;
//     }
//     var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
//     var vindex = 0;
//     if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
//         index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
//         vindex++;
//     }
//     while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
//         index -= Math.floor(this.spriteSheet.width / this.frameWidth);
//         vindex++;
//     }

//     var locX = x;
//     var locY = y;
//     var offset = vindex === 0 ? this.startX : 0;
//     ctx.drawImage(this.spriteSheet,
//                   index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
//                   this.frameWidth, this.frameHeight,
//                   locX, locY,
//                   this.frameWidth * scaleBy,
//                   this.frameHeight * scaleBy);
// }

// Animation.prototype.currentFrame = function () {
//     return Math.floor(this.elapsedTime / this.frameDuration);
// }

// Animation.prototype.isDone = function () {
//     return (this.elapsedTime >= this.totalTime);
// }

// function Background(game) {
//     Entity.call(this, game, 0, 400);
//     this.radius = 200;
// }

// Background.prototype = new Entity();
// Background.prototype.constructor = Background;

// Background.prototype.update = function () {
// }

// Background.prototype.draw = function (ctx) {
//     ctx.fillStyle = "SaddleBrown";
//     ctx.fillRect(0,500,800,300);
//     Entity.prototype.draw.call(this);
// }

// function Unicorn(game) {
//     this.animation = new Animation(ASSET_MANAGER.getAsset("./img/RobotUnicorn.png"), 0, 0, 206, 110, 0.02, 30, true, true);
//     this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/RobotUnicorn.png"), 618, 334, 174, 138, 0.02, 40, false, true);
//     this.jumping = false;
//     this.radius = 100;
//     this.ground = 400;
//     Entity.call(this, game, 0, 400);
// }

// Unicorn.prototype = new Entity();
// Unicorn.prototype.constructor = Unicorn;

// Unicorn.prototype.update = function () {
//     if (this.game.space) this.jumping = true;
//     if (this.jumping) {
//         if (this.jumpAnimation.isDone()) {
//             this.jumpAnimation.elapsedTime = 0;
//             this.jumping = false;
//         }
//         var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
//         var totalHeight = 200;

//         if (jumpDistance > 0.5)
//             jumpDistance = 1 - jumpDistance;

//         //var height = jumpDistance * 2 * totalHeight;
//         var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
//         this.y = this.ground - height;
//     }
//     Entity.prototype.update.call(this);
// }

// Unicorn.prototype.draw = function (ctx) {
//     if (this.jumping) {
//         this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34);
//     }
//     else {
//         this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
//     }
//     Entity.prototype.draw.call(this);
// }

// // the "main" code begins here

// var ASSET_MANAGER = new AssetManager();

// //ASSET_MANAGER.queueDownload();
// ASSET_MANAGER.downloadAll();

// ASSET_MANAGER.downloadAll(function () {
//     console.log("starting up da sheild");
//     var canvas = document.getElementById('gameWorld');
//     var ctx = canvas.getContext('2d');

//     var gameEngine = new GameEngine();
//     var bg = new Background(gameEngine);
//     //var unicorn = new Unicorn(gameEngine);

//     gameEngine.addEntity(bg);
//     //gameEngine.addEntity(unicorn);

//     gameEngine.init(ctx);
//     gameEngine.start();
// });
