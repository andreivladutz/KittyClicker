class Node {
	constructor(tile, parentNode = null) {
		// keep the tile represented by this node
		this.tile = tile;
		// unique id
		this.id = tile.y * Node.MAP_SIZES[Node.CURR_MAP_NAME].WIDTH + tile.x;

		this.parentNode = parentNode;

		// f = h + g in AStar algorithm where h is the heuristic function value
		// in our case h = distance from this tile to the endTile
		this.f = 0;
		// the cost from the startTile to this tile -> here = the distance
		this.g = 0;
	}

	// for each tile we will consider the coords of its center
	static translateToMapCoords(tile) {
		let lftMapX = tile.x * Node.TILE_SIZE, topMapY = tile.y * Node.TILE_SIZE;

		// offset to the center of the tile
		return {x: lftMapX + Node.TILE_SIZE / 2, y: topMapY + Node.TILE_SIZE / 2};
	}

	// returns the tile successors for this tile
	getSuccessors() {
		// get all neighbouring tiles
		let neighboursTiles = [].concat(this.getNorth(), this.getEast(), this.getSouth(), this.getWest());

		// remove the unwalkable ones
		for (let index = neighboursTiles.length - 1; index >= 0; index--) {
			let tile = neighboursTiles[index], mapX, mapY;
			({x: mapX, y: mapY} = Node.translateToMapCoords(tile));

			// we have collision on this tile
			if (!Pet.verifyValidMapCoords(mapX, mapY)) {
				neighboursTiles.splice(index, 1);
			}
		}

		return neighboursTiles;
	}

	hasNorth() {
		return this.tile.y > 0;
	}

	hasSouth() {
		return this.tile.y < Node.MAP_SIZES[Node.CURR_MAP_NAME].HEIGHT - 1;
	}

	hasEast() {
		return this.tile.x < Node.MAP_SIZES[Node.CURR_MAP_NAME].WIDTH - 1;
	}

	hasWest() {
		return this.tile.x > 0;
	}

	getNorth() {
		if (!this.hasNorth()) {
			return [];
		}

		let northTiles = [{x: this.tile.x, y: this.tile.y - 1}];

		// north-east
		if (this.hasEast()) {
			northTiles.push({x: this.tile.x + 1, y: this.tile.y - 1});
		}

		// north-west
		if (this.hasWest()) {
			northTiles.push({x: this.tile.x - 1, y: this.tile.y - 1});
		}

		return northTiles;
	}

	getSouth() {
		if (!this.hasSouth()) {
			return [];
		}

		let southTiles = [{x: this.tile.x, y: this.tile.y + 1}];

		// south-east
		if (this.hasEast()) {
			southTiles.push({x: this.tile.x + 1, y: this.tile.y + 1});
		}

		// south-west
		if (this.hasWest()) {
			southTiles.push({x: this.tile.x - 1, y: this.tile.y + 1});
		}

		return southTiles;
	}

	// just the east tile
	getEast() {
		if (!this.hasEast()) {
			return [];
		}

		return [{x: this.tile.x + 1, y: this.tile.y}];
	}

	// just the west tile
	getWest() {
		if (!this.hasWest()) {
			return [];
		}

		return [{x: this.tile.x - 1, y: this.tile.y}];
	}

	// check if a node is wrapping the same tile as another node
	equals(node) {
		return this.id === node.id;
	}

	getPath() {
		let currNode = this,
			path = [];

		while (currNode) {
			path.push(currNode.tile);
			currNode = currNode.parentNode;
		}

		return path;
	}
}

// will be set every time the player switches map
Node.CURR_MAP_NAME = "";

Node.TILE_SIZE = 32;

// the dictionary for each mapName of WIDTH and HEIGHT
Node.MAP_SIZES = {};
// real values will be initialised at map creation

Node.MAP_SIZES["livingRoom"] = {
	WIDTH: 0,
	HEIGHT: 0
};

// singleton class
const AStarInstanceManager = (function() {
	let AStarInstance = null;

	class AStar {
		constructor(distanceFunction) {
			// distance function used
			this.distanceFunction = distanceFunction;
		}

		// get shortest path between stTile and one of endTiles
		computePath(stTile, endTiles, distToleranceStop) {
			let startNode = new Node(stTile),
				endNodes = [];

			for (let tile of endTiles) {
				endNodes.push(new Node(tile))
			}

			// if visited visited[id] is the node with id
			let visited = [],
				OPEN = [startNode], currNode;

			// startNode was visited
			visited[startNode.id] = startNode;

			this.algorithmStartTime = new Date().getTime();

			while (OPEN.length) {
				// probably not going to find a path. don't let the user waiting (the game is probably going to freeze)
				if (new Date().getTime() - this.algorithmStartTime > AStar.MAX_WAIT_TIME) {
					// no solution
					return null;
				}

				// get first element
				currNode = OPEN.shift();

				/*console.log("OPEN", OPEN);
				console.log("currNode", currNode);
				debugger;*/

				if (distToleranceStop !== undefined) {
					if (currNode.f !== 0 && currNode.f <= distToleranceStop) {
						return currNode.getPath();
					}
				}

				// if we reached any of the endNodes
				for (let endNode of endNodes) {
					if (currNode.equals(endNode)) {
						return currNode.getPath();
					}
				}

				let successorTiles = currNode.getSuccessors();

				for (let succTile of successorTiles) {
					let successorNode = new Node(succTile, currNode), visitedNode;

					// distance from the start node to this node

					/*successorNode.g = currNode.g + this.distanceFunction(Node.translateToMapCoords(currNode.tile),
						Node.translateToMapCoords(succTile));*/

					// f is the minimum distance to one of the endTiles
					successorNode.f = Infinity;

					for (let endTile of endTiles) {
						successorNode.f = Math.min(successorNode.f, this.distanceFunction(Node.translateToMapCoords(endTile),
							Node.translateToMapCoords(succTile)));
					}

					// this node was already visited so we check if this time we
					// improved the distance to it and update it accordingly
					if ((visitedNode = visited[successorNode.id])) {
						if (visitedNode.f > successorNode.f && !visitedNode.equals(currNode.parentNode)) {
							// update the values with the better values
							visitedNode.f = successorNode.f;
							//visitedNode.g = successorNode.g;
							visitedNode.parentNode = currNode;
						}
					}
					// hasn't been visited before
					else {
						visited[successorNode.id] = successorNode;
						successorNode.parentNode = currNode;
						OPEN.push(successorNode);
					}
				}
				// sort ascending by f values, descending by g values
				OPEN.sort(function (a, b) {
					return a.f - b.f;
				});
			}
			// no solution
			return null;
		}
	}

	AStar.MAX_WAIT_TIME = 150;

	// default value is manhattanDist function
	return function instantiate(distFunc = euclideanDistance) {
		if (AStarInstance === null) {
			AStarInstance = new AStar(distFunc);
		}

		return AStarInstance;
	}
})();