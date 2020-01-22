//Global variables
var myCells = [[],[]]; // Tile grid
var myRegions = []; // Contains IDs of tiles per region
var myCanvasSize;

function Unit() {
    /**
     * name
     * atk
     * def
     * cost
     * mov
     * qty
     */
}

function Building() {
    /**
     * name
     * atk
     * def
     * cost
     * upgrade
     * effects
     */
}

function Tile() {
    /**
     * ID
     * region
     * owner
     * garrisonedUnit
     * buildings[]
     */
}

function Region() {
    /**
     * ID
     * bonus effect
     */
}

function LoadMap() {
    /**
     * Line 1 - Width, Height
     * Line 2 - Region Mapping - 
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
 * This function will be onLoad from the canvas
 */
function Main() {
    /**
     * Attach onClick event
     * load Welcome Sreen
     * loadMap
     */
}