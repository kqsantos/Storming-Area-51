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

// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
};

Background.prototype.update = function () {
};

//spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale

function SwordDude(game, spritesheet) {
    this.animation = new Animation(spritesheet, 51, 37.5, 7, 0.110, 45, true, 2);
    this.x = 0;
    this.y = 200;
    this.speed = 100;
    this.game = game;
    this.ctx = game.ctx;
    this.jumpSpeed = 200;
}

SwordDude.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

SwordDude.prototype.update = function () {
    if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14 && this.animation.elapsedTime > this.animation.totalTime * 2 / 14)
        this.x += this.game.clockTick * this.speed;

    
    if (this.animation.elapsedTime < this.animation.totalTime * 5/14 && this.animation.elapsedTime > this.animation.totalTime * 4.6/14)
        this.y -= this.game.clockTick * this.jumpSpeed*9/10;

    if (this.animation.elapsedTime < this.animation.totalTime * 5.4/14 && this.animation.elapsedTime > this.animation.totalTime * 5/14)
        this.y += this.game.clockTick * this.jumpSpeed;

    if (this.x > 225) this.x = 0;
}

function Skele(game, spritesheet) {
    this.animation = new Animation(spritesheet, 32, 32, 10, 0.24, 20, true, 2);
    this.x = 0;
    this.y = 220;
    this.speed = -95;
    this.game = game;
    this.ctx = game.ctx;
}

Skele.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

Skele.prototype.update = function () {
    if (this.animation.elapsedTime < this.animation.totalTime * 6/14)
        this.x += this.game.clockTick * this.speed;

    if (this.x < 300) this.x = 500;
}

AM.queueDownload("./img/adventurer-Sheet.png");
AM.queueDownload("./img/pixelbBackground.png");
AM.queueDownload("./img/skeleWalkFight.png");


AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    var sword = new SwordDude(gameEngine, AM.getAsset("./img/adventurer-Sheet.png"));

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/pixelbBackground.png")));
    gameEngine.addEntity(sword);
    gameEngine.addEntity(new Skele(gameEngine, AM.getAsset("./img/skeleWalkFight.png")),sword);


    console.log("All Done!");
});