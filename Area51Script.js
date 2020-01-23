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

/**
 * Tile ID list:
 * 0 to positive integers = Regions
 * -1 = Inaccesible
 * -2 = Add Unit
 * -3 = Add Building
 * -4 = Move Unit
 * -5 = Split Unit
 * -6 = Upgrade Building
 */
function Tile() {
    /**
     * ID
     * name
     * region
     * owner
     * garrisonedUnit
     * buildings[]
     */
}

function Region() {
    /**
     * ID
     * name
     * bonus effect
     */
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
}