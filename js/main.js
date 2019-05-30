MapLoader.RESOURCES = [
	{
		name: "livingRoom",
		itemType: "JSON",
		url: "Tiled/map/livingRoom.json"
	}
];

const LIVING_ROOM = "livingRoom", MAPS_READY_EVENT = "loadedMaps";

Pet.RESOURCES = [
	{
		name: "kitty",
		itemType: "img",
		url: "img/cat.png"
	},
	{
		name: "doggo",
		itemType: "img",
		url: "img/dog.png"
	},
];

Pet.LOADED_IMAGES = {

};

let gameObject = {
	loadedPromisesArr: [],
	resourceLoader: new ResourceLoader(),
	canvasManager: null,
	mapRenderer: null,
	mapLoader: null,
	init: initGame,
	draw: draw,
	PETS: [],
	RESTService: new RESTService(),
	DOGGOTYPE: -1,
	KITTYTYPE: -1,
	PETSHOP_REST: [],
	currentMiufs: 0,
	GUI: null,
	handleClick,
};

function handleClick(e) {
	let mapCoords = this.mapRenderer.screenCoordsToMapCoords(e.detail);

	for (let pet of this.PETS) {
		if (mapCoords.x >= pet.x - Pet.FRAME_WIDTH / 2 && mapCoords.x <= pet.x + Pet.FRAME_WIDTH / 2
			&& mapCoords.y >= pet.y - Pet.FRAME_HEIGHT && mapCoords.y <= pet.y && !pet.asleep) {

			this.GUI.showInteractions(pet);
			pet.stopMoving();
			pet.openedWindow = true;

			return;
		}
	}

	this.GUI.hideInteractionsMenu();
}

function initGame() {
	this.canvasManager = CanvasManagerFactory(document.getElementById("gameCanvas"));
	this.mapLoader = new MapLoader(this.resourceLoader);

	function loadedMap(resolve, reject) {
		gameObject.mapLoader.on(MAPS_READY_EVENT, function () {
			gameObject.mapRenderer = gameObject.mapLoader.getMapRenderer();
			//gameObject.mapRenderer.showCollisions();

			resolve();
		});
	}

	function gotPetShop(resolve) {
		gameObject.RESTService.getPetshop(function(petShopArray) {
			gameObject.PETSHOP_REST =  petShopArray;

			resolve();
		});
	}

	function initedPets(resolve) {
		gameObject.RESTService.getAllPets(function(petsArray) {
			for (let petDetail of petsArray) {
				gameObject.PETS.push(new Pet(petDetail.name, petDetail.id, petDetail.hungry, petDetail.asleep,
					petDetail.type, petDetail.hunger, petDetail.sleepiness, petDetail.playfullness));
			}

			resolve();
		});
	}

	function initedConstants(resolve) {
		gameObject.RESTService.getPetsConstants(function(constants) {
			gameObject.DOGGOTYPE = constants.doggo;
			gameObject.KITTYTYPE = constants.kitty;

			resolve();
		});
	}

	// load the pet images
	let localResLoader = new ResourceLoader();

	localResLoader.add(Pet.RESOURCES);

	/*  once an image got loaded push it to the array of loaded images */
	for (let imageObject of Pet.RESOURCES) {
		let imageName = imageObject.name;

		localResLoader.addEventListener("loaded" + imageName, function(e) {
			Pet.LOADED_IMAGES[imageName] = e.detail;
		});
	}

	function loadedPetImages(resolve) {
		localResLoader.addEventListener("finishedLoadingPets", function() {
			resolve();
		});
	}

	localResLoader.load("Pets");

	// wait for the loading of the game map
	this.loadedPromisesArr.push(promisify(loadedMap));
	// wait on the loading of the pet images
	this.loadedPromisesArr.push(promisify(loadedPetImages));
	// wait for the details of the pet shop
	this.loadedPromisesArr.push(promisify(gotPetShop));
	// inited constants (int type of doggo and kitty)
	this.loadedPromisesArr.push(promisify(initedConstants));

	waitOnAllPromises(this.loadedPromisesArr).then(function() {
		// got info about the pets and inited the pets
		return promisify(initedPets);
	}).then(
		function onResolved() {
			gameObject.GUI = new GUI();
			gameObject.GUI.updateMiufs();

			requestAnimationFrame(gameObject.draw);
		},
		function onRejected(err) {
			console.error(err);
		}
	);

	this.mapLoader.load();
}

function draw() {
	// FIRST UPDATE ALL PETS
	for (let entity of gameObject.PETS) {
		entity.update();
	}

	// make sure we draw entities in order
	gameObject.PETS.sort(function cmp(a, b) {
		if (a.y === b.y) {
			return a.x - b.x;
		}

		return a.y - b.y;
	});

	// DRAW MAP
	gameObject.mapRenderer.draw();

	// DRAW THE ENTITIES
	for (let entity of gameObject.PETS) {
		entity.draw();
	}

	requestAnimationFrame(gameObject.draw);
}

function main() {
	// init the game on the server
	gameObject.RESTService.initGame(function(response) {
		if (response.ok) {
			gameObject.init();
		}
		else {
			console.error("ERROR OCCURRED. CANNOT START GAME.");
		}
	});
}

function testREST() {
	function test(obj) {
		console.log(obj);
	}

	gameObject.RESTService.getAllPets(test);
	gameObject.RESTService.getPet(test, 0);
	gameObject.RESTService.buyPet(test, 0);
	gameObject.RESTService.getPetshop(test);
	gameObject.RESTService.getPetsConstants(test);
	gameObject.RESTService.getMiufs(test);
	gameObject.RESTService.feedPet(test, 0, 5);
	gameObject.RESTService.petAnimal(test, 0);
	gameObject.RESTService.playWithPet(test, 0);
}