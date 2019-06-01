class Pet {
	// type = doggo's constant or kitty's constant
	constructor(name, id, hungry, asleep, type, hunger, sleepiness, playfullness, color) {
		this.ctx = CanvasManagerFactory().ctx;

		this.name = name;
		this.id = id;
		this.hungry = hungry;
		this.asleep = asleep;
		this.type = type;

		this.hunger = hunger;
		this.sleepiness = sleepiness;
		this.playfullness = playfullness;

		this.color = color;

		this.x = null;
		this.y = null;

		this.AStar = AStarInstanceManager();

		this.state = "idle";
		this.lastChangedState = new Date().getTime();

		let random;
		do {
			random = Math.random();
		} while (random < 0.35);

		this.changeStateInterval = Pet.CHANGE_STATE_INTERVAL * random;

		this.initAnimators();

		this.openedWindow = false;
	}

	initPosition() {
		let mapWidth = gameObject.mapRenderer.getMapWidth(),
			mapHeight = gameObject.mapRenderer.getMapHeight(),
			middleMapX = mapWidth / 2, middleMapY = mapHeight / 2;

		({x: this.x, y: this.y} = Pet.getRandomPointAround(middleMapX, middleMapY, Pet.RANGE));
	}

	initAnimators() {
		this.walkingTimer = null;
		this.walkingFrameAnimator = new Animator(Pet.MOVEMENT_ANIMATION_DURATION * Pet.WALK_MAX_COLUMNS);
		// infinite animation, we use the start and stop methods on this animator
		// to stop and resume the walk animation
		this.walkingFrameAnimator.setRepeatCount(Animator.INFINITE);

		this.idleTimer = null;
		this.idleFrameAnimator = new Animator(Pet.IDLE_DURATION * Pet.IDLE_MAX_COLUMNS);
		// infinite animation, we use the start and stop methods on this animator
		// to stop and resume the walk animation
		this.idleFrameAnimator.setRepeatCount(Animator.INFINITE);

		this.movementAnimator = new Animator(Pet.MOVEMENT_DURATION);
	}

	updateFrames() {
		if (this.state === "walking") {
			if (!this.walkingTimer) {
				this.walkingTimer = new Timer();
				this.walkingFrameAnimator.start();
			}

			this.currentFrame = Math.floor(this.walkingFrameAnimator.update(this.walkingTimer) * (Pet.WALK_MAX_COLUMNS));
			this.walkingTimer.lastUpdatedNow();

			if (!this.movingOneTile && this.foundPath && this.foundPath.length) {
				this.moveOneTile(this.foundPath.pop());
			}


			let fraction = this.movementAnimator.update(this.movementTimer);

			// the animator might have stopped
			if (!this.movingOneTile) {
				fraction = 1;
			}

			this.x = this.startX + (this.endX - this.startX) * fraction;
			this.y = this.startY + (this.endY - this.startY) * fraction;

			this.movementTimer && this.movementTimer.lastUpdatedNow();
		}
		else {
			this.walkingFrameAnimator.stop();
			this.walkingTimer = null;
		}

		if (this.state === "idle") {
			if (!this.idleTimer) {
				this.idleTimer = new Timer();
				this.idleFrameAnimator.start();
			}

			this.currentFrame = Math.round(this.idleFrameAnimator.update(this.idleTimer) * (Pet.IDLE_MAX_COLUMNS - 1));
			this.idleTimer.lastUpdatedNow();

			this.direction = Pet.IDLE_STATE;
		}
		else {
			this.idleFrameAnimator.stop();
			this.idleTimer = null;
		}

		if (this.state === "asleep") {
			this.currentFrame = Pet.SLEEP_FRAME;
		}
	}

	computeRandomWalkPath() {
		let thisTile = gameObject.mapRenderer.mapCoordsToTileCoords({x: this.x, y: this.y}),
			randomPoint = Pet.getRandomPointAround(this.x, this.y, Pet.RANGE);

		if (randomPoint === null) {
			return;
		}

		let randomTile = gameObject.mapRenderer.mapCoordsToTileCoords(randomPoint);

		this.foundPath = this.AStar.computePath(thisTile, [randomTile], Pet.RANDOM_WALK_TOLERANCE);

		if (this.foundPath === null) {
			this.foundPath = [];
			return;
		}

		this.foundPath.pop();
	}

	moveOneTile(tile) {
		this.movingOneTile = true;

		this.movementTimer = new Timer();
		this.startX = this.x;
		this.startY = this.y;

		let tileToMapCoords = Node.translateToMapCoords(tile);
		this.endX = tileToMapCoords.x;
		this.endY = tileToMapCoords.y;

		let screenEndCoords = gameObject.mapRenderer.mapCoordsToScreenCoords({x: this.endX, y: this.endY});
		this.computeDirection(screenEndCoords.x, screenEndCoords.y);

		this.movementAnimator.start();

		// overriding hook function
		this.movementAnimator._onAnimationEnd = (function() {
			// moving stopped
			this.movingOneTile = false;

			this.movementTimer = null;
			this.movementAnimator.stop();
		}).bind(this);
	};

	// this function will update the angle of the pet and the direction
	computeDirection(x, y) {
		({x: this.coordX, y: this.coordY} = gameObject.mapRenderer.mapCoordsToScreenCoords({x: this.x, y: this.y}));

		// atan2 computes the angle relative to point 0, 0
		// so we have to translate the coords to a coord system where
		// the origin is the actor feet position
		x -= this.coordX;
		y -= this.coordY;

		// Left this for the curious ones that want to see the angles update
		// console.log(this.angle * 180 / Math.PI);

		this.angle = Math.atan2(y, x);

		// if the angle is between PI / 4 and 3 * PI / 4 the actor is looking down
		if (this.angle >= Math.PI / 4 && this.angle <= 3 * Math.PI / 4) {
			this.direction = Pet.DOWN_DIRECTION;
		}
		// if the angle is between - PI / 4 and PI / 4 the actor is looking right
		else if (this.angle >= - Math.PI / 4 && this.angle <= Math.PI / 4) {
			this.direction = Pet.RIGHT_DIRECTION;
		}
		// if the angle is between 3 * PI / 4 and PI or - 3 * PI / 4 and - PI the actor is looking left
		else if (Math.abs(this.angle) >= 3 * Math.PI / 4 && Math.abs(this.angle) <= Math.PI) {
			this.direction = Pet.LEFT_DIRECTION;
		}
		// if the angle is between - 3 * PI / 4 and - PI / 4 the actor is looking up
		else if (this.angle <= - Math.PI / 4 && this.angle >= - 3 * Math.PI / 4) {
			this.direction = Pet.UP_DIRECTION;
		}
	};

	checkState() {
		let timeNow = new Date().getTime();

		if (this.asleep && this.state !== "asleep") {
			this.state = "asleep";
			this.direction = (Math.random() < 0.5)? Pet.RIGHT_DIRECTION : Pet.LEFT_DIRECTION;

			if (this.openedWindow) {
				gameObject.GUI.hideInteractionsMenu()
			}
		}
		else if (!this.asleep && (this.state === "idle" || this.state === "asleep")
			&& timeNow - this.lastChangedState > this.changeStateInterval && !this.openedWindow) {

			this.lastChangedState = timeNow;

			this.state = "walking";
			this.computeRandomWalkPath();
		}
		else if (!this.asleep && (this.state === "walking" || this.state === "asleep") && this.foundPath
			&& this.foundPath.length === 0) {

			this.lastChangedState = timeNow;

			this.state = "idle";
		}
	}

	update() {
		this.checkState();
		this.updateFrames();

		let timeNow = new Date().getTime();

		if (timeNow - this.lastUpdate < Pet.UPDATE_INTERVAL) {
			return;
		}

		this.lastUpdate = timeNow;

		this.requestUpdate();
	}

	requestUpdate(callback = null) {
		gameObject.RESTService.getPet((function selfUpdate(petObj) {
			this.asleep = petObj.asleep;
			this.hungry = petObj.hungry;

			this.hunger = petObj.hunger;
			this.playfullness = petObj.playfullness;
			this.sleepiness = petObj.sleepiness;

			if (callback !== null) {
				callback();
			}
		}).bind(this), this.id);
	}

	draw() {
		if (this.x === null && this.y === null) {
			this.initPosition();
		}

		let screenCoords = gameObject.mapRenderer.mapCoordsToScreenCoords({x: this.x, y: this.y}),
			image = (this.type === gameObject.DOGGOTYPE)? Pet.LOADED_IMAGES["doggo"] : Pet.LOADED_IMAGES["kitty"];

		let x = Math.floor(screenCoords.x) - Pet.FRAME_WIDTH / 2, y = Math.floor(screenCoords.y) - Pet.FRAME_HEIGHT;

		this.ctx.drawImage(image, (this.color * Pet.TOTAL_FRAMES + this.currentFrame) * Pet.FRAME_WIDTH,
			this.direction * Pet.FRAME_HEIGHT, Pet.FRAME_WIDTH, Pet.FRAME_HEIGHT,
			x, y, Pet.FRAME_WIDTH, Pet.FRAME_HEIGHT);

		this.ctx.strokeStyle = "black";
		this.ctx.fillStyle = "white";
		this.ctx.font = "10px";

		this.ctx.fillText(this.name, Math.floor(screenCoords.x) - Pet.NAME_OFFSET_X,
			y - Pet.NAME_OFFSET_Y, Pet.FRAME_WIDTH);
	}

	stopMoving() {
		if (this.state !== "walking") {
			return;
		}

		this.state = "idle";
		this.movementAnimator._onAnimationEnd();
	}
}

// 3 seconds
Pet.UPDATE_INTERVAL = 3 * 1000;
Pet.FRAME_WIDTH = 64;
Pet.FRAME_HEIGHT = 64;
Pet.POINT_SEARCH_TIME = 250;
Pet.RANGE = 500;

Pet.MOVEMENT_ANIMATION_DURATION = 150;
Pet.IDLE_DURATION = 250;
Pet.MOVEMENT_DURATION = 500;
Pet.WALK_MAX_COLUMNS = 3;
Pet.IDLE_MAX_COLUMNS = 2;
Pet.TOTAL_FRAMES = 4;

Pet.RIGHT_DIRECTION = 0;
Pet.UP_DIRECTION = 1;
Pet.DOWN_DIRECTION = 2;
Pet.LEFT_DIRECTION = 3;
Pet.IDLE_STATE = 4;

Pet.SLEEP_FRAME = 3;

Pet.WHITE_PET = 0;
Pet.CREAM_PET = 1;
Pet.MAROON_PET = 2;
Pet.BLACK_PET = 3;

Pet.CHANGE_STATE_INTERVAL = 6000;

Pet.RANDOM_WALK_TOLERANCE = 16;

Pet.NAME_OFFSET_X = 15;
Pet.NAME_OFFSET_Y = 8;

// verify if map coords are in range and not colliding with anything on the map
Pet.verifyValidMapCoords = function(x, y) {
	let currMapWidth = gameObject.mapRenderer.getMapWidth(), currMapHeight = gameObject.mapRenderer.getMapHeight();

	if (x < Pet.FRAME_WIDTH / 2 || x > currMapWidth - Pet.FRAME_WIDTH / 2
		|| y < Pet.FRAME_HEIGHT / 2 || y > currMapHeight - Pet.FRAME_HEIGHT / 2) {

		return false;
	}

	let bottomTileCoords = gameObject.mapRenderer.mapCoordsToTileCoords({x, y}),
		topTileCoords = gameObject.mapRenderer.mapCoordsToTileCoords({x, y: y - Pet.FRAME_HEIGHT}),
		collisionMatrix = gameObject.mapRenderer.currentMapInstance.collisionMatrix;

	if (!collisionMatrix[bottomTileCoords.y] || !collisionMatrix[topTileCoords.y]) {
		return false;
	}
	else if (collisionMatrix[bottomTileCoords.y][bottomTileCoords.x] === undefined
		|| collisionMatrix[topTileCoords.y][topTileCoords.x] === undefined) {

		return false;
	}

	return !(collisionMatrix[bottomTileCoords.y][bottomTileCoords.x] || collisionMatrix[topTileCoords.y][topTileCoords.x]);

};

/*
	static method to get a random map point positioned in range around (x, y) map point
 */
Pet.getRandomPointAround = function(x, y, range) {
	// we might just not find any point because there isn't any valid one in this range
	// so after some time we stop the search and return null if no point has been found
	let searchStartTime = new Date().getTime(), foundX, foundY;

	do {
		// exceeded search time. there probably isn't any point available
		if (new Date().getTime() - searchStartTime > Pet.POINT_SEARCH_TIME ) {
			return null;
		}

		let xSign = (Math.random() < 0.5)? -1 : 1,
			ySign = (Math.random() < 0.5)? -1 : 1;
		foundX = x + xSign * Math.random() * range;
		foundY = y + ySign * Math.random() * range;

	} while(!Pet.verifyValidMapCoords(foundX, foundY));

	return {x: foundX, y: foundY};
};