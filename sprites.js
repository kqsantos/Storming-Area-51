// ===================================================================
// Start - Soldier Captain
// ===================================================================
function SoldierCaptain(game, x, y) {
    this.animation = new Animation(AM.getAsset("./img/sprites/cap_soldier_animated.png"), 58, 80, 173, 0.2, 3, true, 1);
    this.standing = AM.getAsset("./img/sprites/cap_soldier_standing.png");
    this.selected = false;
    this.x = x;
    this.y = y;
    Entity.call(this, game, this.x, this.y);
}

SoldierCaptain.prototype = new Entity();
SoldierCaptain.prototype.constructor = SoldierCaptain;

SoldierCaptain.prototype.update = function (ctx) { //update the owner
    // this.x = prevCameraOrigin.x - cameraOrigin.x + this.x;
    // this.y = prevCameraOrigin.y - cameraOrigin.y + this.y;
}

SoldierCaptain.prototype.draw = function (ctx) {
    if (this.selected) {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim));
    } else {
        ctx.drawImage(this.standing, this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim));
    }

}
// ===================================================================
// End - Soldier Captain
// ===================================================================


// ===================================================================
// Start - Alien Captain
// ===================================================================
function AlienCaptain(game, x, y) {
    this.animation = new Animation(AM.getAsset("./img/sprites/cap_alien_animated.png"), 77, 80, 233, 0.2, 3, true, 1);
    this.standing = AM.getAsset("./img/sprites/cap_alien_standing.png");
    this.selected = false;
    this.x = x;
    this.y = y;
    Entity.call(this, game, this.x, this.y);
}

AlienCaptain.prototype = new Entity();
AlienCaptain.prototype.constructor = AlienCaptain;

AlienCaptain.prototype.update = function (ctx) { //update the owner
    // this.x = prevCameraOrigin.x - cameraOrigin.x + this.x;
    // this.y = prevCameraOrigin.y - cameraOrigin.y + this.y;
}

AlienCaptain.prototype.draw = function (ctx) {
    if (this.selected) {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim));
    } else {
        ctx.drawImage(this.standing, this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim));
    }

}
// ===================================================================
// End - Alien Captain
// ===================================================================



// ===================================================================
// Start - Alien
// ===================================================================
function Alien(game, x, y) {
    this.animation = new Animation(AM.getAsset("./img/sprites/alien_animated.png"), 56, 60, 174, 0.2, 3, true, 1);
    this.standing = AM.getAsset("./img/sprites/alien_standing.png");
    this.selected = false;
    this.atk = 1;
    this.def = 1;
    this.x = x;
    this.y = y;
    this.count = 1;
    Entity.call(this, game, this.x, this.y);
}

Alien.prototype = new Entity();
Alien.prototype.constructor = Alien;

Alien.prototype.update = function (ctx) { //update the owner
    // this.x = prevCameraOrigin.x - cameraOrigin.x + this.x;
    // this.y = prevCameraOrigin.y - cameraOrigin.y + this.y;
}

Alien.prototype.draw = function (ctx) {
    if (this.selected) {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim));
    } else {
        ctx.drawImage(this.standing, this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim));
    }
    // ctx.drawImage(this.standing, this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim));
    // ctx.drawImage(this.standing, this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim));

    // // add sahdows to numbers
    // ctx.fillStyle = "bada55";
    // ctx.font = "10px Arial";
    // ctx.fillText(onScreenRegions[i][j].name, (i * dim) + xCal + 2, ((j + 1) * dim) + yCal + 2);

    // //displays numbers
    // ctx.fillStyle = "#bada55";
    // ctx.font = "10px Arial";
    // ctx.fillText(onScreenRegions[i][j].name, (i * dim) + xCal, ((j + 1) * dim) + yCal);

    // displays count

    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.6;
    ctx.fillRect(this.x - (cameraOrigin.x * dim) + 12, this.y - (cameraOrigin.y * dim) + 40, 30, 20);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "#bada55";
    ctx.font = "14px Arial";
    ctx.fillText(this.count, this.x - (cameraOrigin.x * dim) + 18, this.y - (cameraOrigin.y * dim) + 54);


}
// ===================================================================
// End - Alien
// ===================================================================




// ===================================================================
// Start - Soldier
// ===================================================================
function Soldier(game, x, y) {
    this.animation = new Animation(AM.getAsset("./img/sprites/soldier_animated.png"), 44, 60, 216, .2, 5, true, 1);
    this.standing = AM.getAsset("./img/sprites/soldier_standing.png");
    this.selected = false;
    this.atk = 1;
    this.def = 1;
    this.x = x;
    this.y = y;
    this.count = 1;
    Entity.call(this, game, this.x, this.y);
}

Soldier.prototype = new Entity();
Soldier.prototype.constructor = Soldier;

Soldier.prototype.update = function (ctx) { //update the owner
}

Soldier.prototype.draw = function (ctx) {
    if (this.selected) {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim));
    } else {
        ctx.drawImage(this.standing, this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim));
    }
    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.6;
    ctx.fillRect(this.x - (cameraOrigin.x * dim) + 8, this.y - (cameraOrigin.y * dim) + 40, 30, 20);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "#bada55";
    ctx.font = "14px Arial";
    ctx.fillText(this.count, this.x - (cameraOrigin.x * dim) + 14, this.y - (cameraOrigin.y * dim) + 54);
}
// ===================================================================
// End - Soldier
// ===================================================================



// ===================================================================
// Start - Barracks
// ===================================================================
function Barracks(game, owner, x, y) {
    this.imageRed = AM.getAsset("./img/sprites/barracks_red.png");
    this.imageBlue = AM.getAsset("./img/sprites/barracks_blue.png");
    this.owner = owner;
    this.x = x;
    this.y = y;
    Entity.call(this, game, this.x, this.y);
}

Barracks.prototype = new Entity();
Barracks.prototype.constructor = Barracks;

Barracks.prototype.update = function (ctx) {
}

Barracks.prototype.draw = function (ctx) {
    if (this.owner == 0) {
        ctx.drawImage(this.imageBlue, this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim));
    } else {
        ctx.drawImage(this.imageRed, this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim));
    }
}
// ===================================================================
// End - Barracks
// ===================================================================



// ===================================================================
// Start - Farm
// ===================================================================
function Farm(game, owner, x, y) {
    this.imageRed = AM.getAsset("./img/sprites/farm_red.png");
    this.imageBlue = AM.getAsset("./img/sprites/farm_blue.png");
    this.owner = owner;
    this.x = x;
    this.y = y;
    Entity.call(this, game, this.x, this.y);
}

Farm.prototype = new Entity();
Farm.prototype.constructor = Farm;

Farm.prototype.update = function (ctx) {
}

Farm.prototype.draw = function (ctx) {
    if (this.owner == 0) {
        ctx.drawImage(this.imageBlue, this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim));
    } else {
        ctx.drawImage(this.imageRed, this.x - (cameraOrigin.x * dim), this.y - (cameraOrigin.y * dim));
    }
}
// ===================================================================
// End - Farm
// ===================================================================