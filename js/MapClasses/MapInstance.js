const OBJECT_X = "x", OBJECT_Y = "y", IMAGE_OF_TILESET = "image", 
	  FIRST_TILE_NUMBER = "firstgid", TILES_PER_ROW = "columns",
	  DEFAULT_TILE = "defaultTile", JSON_TILESET_WORKFILE = "tilesetWorkfile"; 

class MapInstance extends EventEmiter {
	constructor(
		mapName,
		tilesetsWorkfiles,
		tileSize,
		mapWidth,
		mapHeight,
		tilesMatrices,
		objectsArr,
		objectTemplates,
		collisionMatrix) {
			super();
			//own map name
			this.mapName = mapName;
			
			//the size of a single square tile
			this.tileSize = tileSize;
			
			//map size in number of tiles
			this.mapWidth = mapWidth;
			this.mapHeight = mapHeight;

			// make sure the Node class KNOWS THE SIZE OF THIS MAP
			Node.MAP_SIZES[mapName].WIDTH = mapWidth;
			Node.MAP_SIZES[mapName].HEIGHT = mapHeight;

			//the array of matrices of tile numbers
			//each matrix is a layer of tiles
			this.tilesMatrices = tilesMatrices;

			
			//true => we cannot walk on the tile 
			//false => no collision with the tile
			this.collisionMatrix = collisionMatrix;
			

			//the map coordinates
			this.mapX = 0;
			this.mapY = 0;

			this.inputHandler = new InputHandler(CanvasManagerFactory().canvas);
			
			CanvasManagerFactory().addEventListener(CANVAS_RESIZE_EVENT, (function() {
				this.updateViewportSize();
				// recenter the map
				this.moveMap(0, 0);
			}).bind(this));
			
			this.updateViewportSize();
			this.moveMap(0, 0);

			this.inputHandler.on("move", (function(e) {
				this.moveMap(e.detail.deltaX, e.detail.deltaY);
			}).bind(this));

			this.inputHandler.on("down", gameObject.handleClick.bind(gameObject));
	}
}

_p = MapInstance.prototype;

_p.updateViewportSize = function() {
	//the size of the viewport in pixels
	this.viewportWidth = CanvasManagerFactory().canvas.width;
	this.viewportHeight = CanvasManagerFactory().canvas.height;
};



_p.moveMap = function(deltaX, deltaY) {
	let pixelsMapWidth = this.mapWidth * this.tileSize,
		pixelsMapHeight = this.mapHeight * this.tileSize;
	
	this.updateViewportSize();

	/* 
		if the map can be displayed entirely on the screen we just center it
	*/
	if (this.viewportWidth >= pixelsMapWidth) {
		this.mapX = Math.floor((this.viewportWidth - pixelsMapWidth) / 2);
	}
	
	else {
		this.mapX = Math.min(
			this.mapX + deltaX, 0
		);
		
		this.mapX = Math.max(
			- pixelsMapWidth + this.viewportWidth, this.mapX
		);
	}
	
	/* 
		if the map can be displayed entirely on the screen we just center it
	*/
	if (this.viewportHeight >= pixelsMapHeight) {
		this.mapY = Math.floor((this.viewportHeight - pixelsMapHeight) / 2);
	}
	
	else {
		this.mapY = Math.min(
			this.mapY +  deltaY, 0
		);

		this.mapY = Math.max(
			- pixelsMapHeight + this.viewportHeight, this.mapY
		);
	}
};