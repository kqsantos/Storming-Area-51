window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function GameEngine() {
    this.entities = [];
    // this.factionEntities = [];
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.click = null;
    this.keyDown = null;
    this.cameraOrigin = null;
    this.newGame = false;
    this.zoomIn = false;
    this.zoomOut= false;
    this.mouseOver = null;
    this.GUIEntities = [];
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.timer = new Timer();
    this.startInput();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');

    var that = this;
    var elem = this.ctx.canvas;

    if (elem && elem.getContext) {
        // get context
        var context = elem.getContext('2d');

        // Animation Mouse Down Listener
        elem.addEventListener('click', function (e) {

            that.click = { x: e.layerX, y: e.layerY };
            // console.log(e);
        }, false);

        elem.addEventListener("keydown", function (e) {
            that.keyDown = e;
            // console.log("%c KeyDown info below this:", "background: #222; color: #bada55");
            // console.log(e);
            // console.log("Key Down Event - Char " + e.code + " Code " + e.keyCode);
        }, false);

        elem.addEventListener("mousemove", function (e) {
            //console.log(e);
            that.mouseOver = e;
            
            // console.log("%c KeyDown info below this:", "background: #222; color: #bada55");
            // console.log(e);
            // console.log("Key Down Event - Char " + e.code + " Code " + e.keyCode);
        }, false);

        elem.addEventListener("wheel", function (e) {
            if(e.deltaY < 0) {
                that.zoomIn = true;
                console.log("zoom in");
            }
            if(e.deltaY > 0) {
                that.zoomOut = true;
                console.log("zoom out");
            }
        }, false);

    }

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.addGUIEntity = function (entity) {
    console.log('added entity');
    this.GUIEntities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();

    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    for (var i = 0; i < this.GUIEntities.length; i++) {
        this.GUIEntities[i].draw(this.ctx);
    }

    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    var GUIentitiesCount = this.GUIEntities.length;
    for (var i = 0; i < GUIentitiesCount; i++) {
        var GUIentity = this.GUIEntities[i];

        if (!GUIentity.removeFromWorld) {
            GUIentity.update();
        }
    }

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    
    for (var i = this.GUIEntities.length - 1; i >= 0; --i) {
        if (this.GUIEntities[i].removeFromWorld) {
            this.GUIEntities.splice(i, 1);
            
        }
    }
    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            // console.log("Splicing")
            // console.log(this.entities);
            // console.log(this.entities[i]);
            this.entities.splice(i, 1);
            // console.log(this.entities);
            
        }
    }

}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.endTurnButtonHoverFlag = null;
}

function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
    this.clickTrigger = null;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
}

function GUIEntity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
    this.clickTrigger = null;
}

GUIEntity.prototype.update = function () {
}

GUIEntity.prototype.draw = function (ctx) {
}