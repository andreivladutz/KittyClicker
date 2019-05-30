"use strict";
const LAST_ANIMATION_TIME = "lastAnimationTime", FRAME_DURATION = "duration";

class MapRenderer extends EventEmiter {
	//the constructor receives the name of the current rendered map
	constructor(currentMapName) {
		super();
		this.canvasManager = CanvasManagerFactory();

		this.changeMap(currentMapName);

		//the offscreen buffer has extra 10 tiles in every direction
		//so it is bigger than the visible canvas
		this.extraBufferTiles = 10;
		
		let tileSize = this.currentMapInstance.tileSize;
		
		this.canvasManager.makeOffscreenBufferBigger(
			(this.extraBufferTiles * 2) * tileSize,
			(this.extraBufferTiles * 2) * tileSize
		);
		
		//flag only for debugging
		this._showCollisions_ = false;
		
		// map instance interaction points that are in proximity to the player
		this.visibleInteractionPoints = [];
		
		let self = this;
		this.canvasManager.addEventListener(
			CANVAS_RESIZE_EVENT,
			function(e) {
				self.offDirty = true;
				
				// in case we zoom out and are at the right end of the map we need to move the map
				// so the end of the map is at the viewport width, otherwise we would see a white margin
				if (self.currentMapInstance && e.detail === ZOOMED_OUT) {
					self.moveMap(0, 0);
				}
			}
		);
	}
}

// dictionary of initialised mapInstances
MapRenderer.MAP_INSTANCES = {};
MapRenderer.CHANGED_MAP_EVENT = "changedMap";
MapRenderer.REDRAWN_OFFSCREEN = "redrawnOffscreen";

MapRenderer.ROOM_OVERLAY_OPACITY = 0.95;

let _p = MapRenderer.prototype;

// the player will inform the mapRenderer that it changed the old room
_p.changedRoom = function() {
	this.offDirty = true;
};

_p.showCollisions = function() {
	this._showCollisions_ = true;
};

_p.changeMap = function(mapName) {
	let oldMapName = this.currentMapName;
	
	this.currentMapName = mapName;
	this.currentMapInstance = MapRenderer.MAP_INSTANCES[mapName];

	// Every time the map changes make sure to let the Node class know
	Node.CURR_MAP_NAME = mapName;
		
	// offDirty flag tells if the offscreenBuffer canvas should be redrawn
	this.offDirty = true;
	
	// RESET EVERYTHING
	this.offScreenVisibleTileArea = null;
	this.visibleTileArea = null;
	this.visibleInteractionPoints = [];
	this.lastDrawnObjects = [];
	
	
	this.emit(MapRenderer.CHANGED_MAP_EVENT, {
		oldMap: oldMapName,
		newMap: mapName
	});
};

_p.checkIfDirty = function() {
	let visArea = this.visibleTileArea,
		offVisArea = this.offScreenVisibleTileArea,
		mapInst = this.currentMapInstance;
	
	if (visArea.startX < offVisArea.startX || visArea.startY < offVisArea.startY 
		|| (visArea.endX >= offVisArea.endX && offVisArea.endX !== mapInst.mapWidth)
		|| (visArea.endY >= offVisArea.endY && offVisArea.endY !== mapInst.mapHeight)) {
		
		this.offDirty = true;
	}
	
	return this.offDirty;
};

_p.computeOffScreenBufferVisibleArea = function() {
	let mI = this.currentMapInstance,
		tileSize = mI.tileSize;
	
	this.offScreenVisibleTileArea = {
		startX : Math.max(
			this.visibleTileArea.startX - this.extraBufferTiles, 0
		),
		startY : Math.max(
			this.visibleTileArea.startY - this.extraBufferTiles, 0
		),
		endX : Math.min(
			this.visibleTileArea.endX + this.extraBufferTiles, mI.mapWidth
		),
		endY : Math.min(
			this.visibleTileArea.endY + this.extraBufferTiles, mI.mapHeight
		),
	};
};

_p.computeVisibleTileArea = function() {
	let mI = this.currentMapInstance,
		viewportWidth = mI.viewportWidth,
		viewportHeight = mI.viewportHeight,
		tileSize = mI.tileSize;
	
	this.visibleTileArea = {
		startX : Math.abs(mI.mapX) / tileSize,
		startY : Math.abs(mI.mapY) / tileSize,
		endX : Math.min(
			(- mI.mapX + viewportWidth) / tileSize, mI.mapWidth
		),
		endY : Math.min(
			(- mI.mapY + viewportHeight) / tileSize, mI.mapHeight
		)
	}
	
	//console.log("START X = " + this.visibleTileArea.startX);
	//console.log("START Y = " + this.visibleTileArea.startY);
	//if (this.offScreenVisibleTileArea){
	//console.log("OFF START X = " + this.offScreenVisibleTileArea.startX);
	//console.log("OFF START Y = " + this.offScreenVisibleTileArea.startY);}
	
	/* if the viewport is bigger than the map */
	if (viewportWidth >= mI.mapWidth * tileSize) {
		this.visibleTileArea.startX = 0;
		this.visibleTileArea.endX = mI.mapWidth;
	}
	
	if (viewportHeight >= mI.mapHeight * tileSize) {
		this.visibleTileArea.startY = 0;
		this.visibleTileArea.endY = mI.mapHeight;
	}
};


//draws all of the layers of a tile without animated ones
_p.drawOffScreenTile = function(i, j, animatedId) {
	let offCtx = this.canvasManager.offScreenCtx,
		mapInstance = this.currentMapInstance,
		tilesMatrices = mapInstance.tilesMatrices,
		tileSize = mapInstance.tileSize;
	
	let stX = this.offScreenVisibleTileArea.startX,
		stY = this.offScreenVisibleTileArea.startY,
		destX = (j - stX) * tileSize,
		destY = (i - stY) * tileSize;
	
	// for every layer of tiles
	for (let tilesMatrix of tilesMatrices) {
		/*
		 * now that tiles layers are kept as sparse matrices we first have to check
		 * if the row of the tile we want to draw really exists or is full of null tiles
		 */
		
		//AND
		
		/*
		 * we check if our tile is an empty tile and if it is we skip it
		 * BEFORE: it was equal to zero but NOW: we don't keep the null tiles in memory anymore
		 * so if it was a NO_TILE (i.e. equal to 0) now it simply doesn't exist in the sparse matrix
		 */
		if (!tilesMatrix[i] || !tilesMatrix[i][j]) {
			continue;
		}
		
		let tileNo = tilesMatrix[i][j].value;
		
		/*
			usedTileset is the tileset which the current tile belongs to from tilesetWorkfiles
		*/
		let usedTileset = tilesMatrix[i][j].usedTileset;
		// the actual tileNo in the actual tileset.json is the id from the map data - firstgid number
		tileNo -= usedTileset[FIRST_TILE_NUMBER];
		
		// skipping the animated tile
		if (tileNo == animatedId) {
			continue;
		}
		
		// doing some quick maths to know which tile to draw and where
		let tilesPerRow = usedTileset.JSONobject[TILES_PER_ROW],
			srcX = (tileNo % tilesPerRow) * tileSize,
			srcY = Math.floor(tileNo / tilesPerRow) * tileSize;
		
		if ("opacity" in tilesMatrix && tilesMatrix["opacity"] != 1) {
			offCtx.save();
			offCtx.globalAlpha = tilesMatrix["opacity"];
		}
		
		offCtx.drawImage(
			usedTileset["image"], 
			srcX, srcY, tileSize, tileSize,
			destX, destY, tileSize, tileSize
		);
		
		if ("opacity" in tilesMatrix && tilesMatrix["opacity"] != 1) {
			offCtx.restore();
		}
		
		// showing the collision tiles with red in debugging mode
		if (this._showCollisions_ && mapInstance.collisionMatrix[i][j]) {
			let color = "rgba(255, 0, 0, 0.2)";

			offCtx.fillStyle = color;
			offCtx.fillRect(destX, destY, tileSize, tileSize);
		}
	}
};

_p.redrawOffscreenBuffer = function() {
	let offCtx = this.canvasManager.offScreenCtx,
		canvas = this.canvasManager.offScreenBuffer;
	
	offCtx.clearRect(0, 0, canvas.width, canvas.height);
	
	let stX = Math.floor(this.offScreenVisibleTileArea.startX),
		stY = Math.floor(this.offScreenVisibleTileArea.startY),
		eX = Math.ceil(this.offScreenVisibleTileArea.endX),
		eY = Math.ceil(this.offScreenVisibleTileArea.endY);
	
	for (let i = stY; i < eY; i++) {
		for (let j = stX; j < eX; j++) {
			// drawing all the tiles on each layer
			this.drawOffScreenTile(i, j, NaN);
		}
	}
	
	// redrew everything so the offScreenCanvas is not dirty anymore
	this.offDirty = false;
};

/*
	draw checks if the offscreenBuffer canvas is "dirty" i.e. if we ran out of bounds
	with the visible map and it needs to be redrawn or the screen has been resized, etc
*/
_p.draw = function() {
	this.computeVisibleTileArea();
	
	if (this.offDirty || this.checkIfDirty()) {
		this.computeOffScreenBufferVisibleArea();
		this.redrawOffscreenBuffer();
	}

	this.currentMapInstance.updateViewportSize();

	let offStX = this.offScreenVisibleTileArea.startX,
		offStY = this.offScreenVisibleTileArea.startY,
		stX = this.visibleTileArea.startX,
		stY = this.visibleTileArea.startY,
		viewportWidth = this.currentMapInstance.viewportWidth,
		viewportHeight = this.currentMapInstance.viewportHeight,
		tileSize = this.currentMapInstance.tileSize,
		pixelsMapWidth = this.currentMapInstance.mapWidth * tileSize,
		pixelsMapHeight = this.currentMapInstance.mapHeight * tileSize;
	
	let ctx = this.canvasManager.ctx,
		canvas = this.canvasManager.canvas,
		offScreenCanvas = this.canvasManager.offScreenBuffer,
		srcX = (stX - offStX) * tileSize,
		srcY = (stY - offStY) * tileSize,
		destX = (viewportWidth >= pixelsMapWidth)? this.currentMapInstance.mapX : 0,
		destY = (viewportHeight >= pixelsMapHeight)? this.currentMapInstance.mapY : 0;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	ctx.drawImage(offScreenCanvas, 
				  srcX, srcY, canvas.width, canvas.height,
				  destX, destY, canvas.width, canvas.height
				 );
};

/*
    all the functions that translate coords receive
    a coords object of the form {x : (x coordinate), y : (y coordinate)}
    and return an object of the same form
*/
_p.screenCoordsToMapCoords = function(coords) {
    let mapInstance = this.currentMapInstance,
        mapX = mapInstance.mapX,
        mapY = mapInstance.mapY,
        
        new_coords = {
            x : coords.x - mapX,
            y : coords.y - mapY
        };
    
    return new_coords;
};

_p.mapCoordsToScreenCoords = function(coords) {
    var mapInstance = this.currentMapInstance,
        mapX = mapInstance.mapX,
        mapY = mapInstance.mapY;

    return {
		x : coords.x + mapX,
		y: coords.y + mapY
	};
};

_p.mapCoordsToTileCoords = function(coords) {
    let mapInstance = this.currentMapInstance;

	return {
		x: Math.floor(coords.x / mapInstance.tileSize),
        y : Math.floor(coords.y / mapInstance.tileSize)
    };
};

_p.tileCoordsToMapCoords = function(coords) {
    let mapInstance = this.currentMapInstance;

    return {
        x : coords.x * mapInstance.tileSize,
        y : coords.y * mapInstance.tileSize
    };
};

_p.screenCoordsToTileCoords = function(coords) {
    return this.mapCoordsToTileCoords(this.screenCoordsToMapCoords(coords));
};

_p.tileCoordsToScreenCoords = function(coords) {
    let new_coords = this.mapCoordsToScreenCoords(this.tileCoordsToMapCoords(coords));
    
    new_coords.x = Math.max(new_coords.x, 0);
    new_coords.y = Math.max(new_coords.y, 0);
    
    return new_coords;
};

// function to move map from mapInstance
_p.moveMap = function(deltaX, deltaY) {
    this.currentMapInstance.moveMap(deltaX, deltaY);
};

_p.setMapCoords = function(mapX, mapY) {
	this.currentMapInstance.mapX = 0;
	this.currentMapInstance.mapY = 0;
	
	this.currentMapInstance.moveMap(mapX, mapY);
};

_p.getViewportSize = function() {
	return {
		width : this.currentMapInstance.viewportWidth,
		height : this.currentMapInstance.viewportHeight
	};
};

_p.getMapWidth = function() {
	return this.currentMapInstance.mapWidth * this.currentMapInstance.tileSize;
};

_p.getMapHeight = function() {
	return this.currentMapInstance.mapHeight * this.currentMapInstance.tileSize;
};

_p.getCurrentMapName = function() {
	return this.currentMapInstance.mapName;
};
