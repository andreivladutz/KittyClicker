// utility to get a copy of an object
function copyObject(obj) {
	return JSON.parse(JSON.stringify(obj));
}

class RESTService {
	constructor() {
		// resLoader used for REST calls
		this.resourceLoader = new ResourceLoader();
	}

	// ALL REQUEST HAVE A CALLBACK THAT WILL BE CALLED WITH THE RESPONSE PARSED JSON

	// handling the general get/post/put request
	handleRequest(callback, resourceObject, initRequest = false) {
		this.resourceLoader = new ResourceLoader();

		// special url when initialising game
		let composedUrl = (initRequest)? resourceObject.url : RESTService.BASE_LINK + resourceObject.url;

		this.resourceLoader.add(resourceObject.name, resourceObject.itemType,
			composedUrl, resourceObject.verb);

		let self = this;
		// when the response comes back call the function callback
		this.resourceLoader.addEventListener("loaded" + resourceObject.name, function onLoadedHandler(e) {
			// call with the parsed json response
			callback(JSON.parse(e.detail.response));

			// remove this listener after handling it
			self.resourceLoader.removeEventListener("loaded" + resourceObject.name, onLoadedHandler);
		});

		this.resourceLoader.load();
	}

	initGame(callback) {
		this.handleRequest(callback, RESTService.LINKS[RESTService.INIT_GAME], true);
	}

	// specialized requests
	getAllPets(callback) {
		this.handleRequest(callback, RESTService.LINKS[RESTService.ALL_PETS]);
	}

	getPet(callback, petId) {
		let getPetObj = copyObject(RESTService.LINKS[RESTService.ONE_PET]);
		getPetObj.url += petId;

		this.handleRequest(callback, getPetObj);
	}

	buyPet(callback, petId) {
		let buyPetObj = copyObject(RESTService.LINKS[RESTService.BUY_PET]);
		buyPetObj.url += petId;

		this.handleRequest(callback, buyPetObj);
	}

	getPetshop(callback) {
		this.handleRequest(callback, RESTService.LINKS[RESTService.PETSHOP])
	}

	getPetsConstants(callback) {
		this.handleRequest(callback, RESTService.LINKS[RESTService.TYPE_CONSTANTS])
	}

	getMiufs(callback) {
		this.handleRequest(callback, RESTService.LINKS[RESTService.GET_MIUFS])
	}

	feedPet(callback, petId, foodPortion) {
		let feedPetObj = copyObject(RESTService.LINKS[RESTService.FEED]);
		feedPetObj.url = "pets/" + petId + feedPetObj.url + foodPortion;

		this.handleRequest(callback, feedPetObj);
	}

	petAnimal(callback, petId) {
		let petAnimalObj = copyObject(RESTService.LINKS[RESTService.PET]);
		petAnimalObj.url = "pets/" + petId + petAnimalObj.url;

		this.handleRequest(callback, petAnimalObj);
	}

	playWithPet(callback, petId) {
		let petAnimalObj = copyObject(RESTService.LINKS[RESTService.PLAY]);
		petAnimalObj.url = "pets/" + petId + petAnimalObj.url;

		this.handleRequest(callback, petAnimalObj);
	}

	renamePet(callback, petId, name) {
		let renamePetRequestObj = copyObject(RESTService.LINKS[RESTService.RENAME_PET]);
		renamePetRequestObj.url = "pets/" + petId + renamePetRequestObj.url + name;

		this.handleRequest(callback, renamePetRequestObj);
	}
}


// constants for accessing LINKS array
RESTService.ALL_PETS = 0;
RESTService.ONE_PET = 1;
RESTService.BUY_PET = 2;
RESTService.PETSHOP = 3;
RESTService.TYPE_CONSTANTS = 4;
RESTService.GET_MIUFS = 5;
RESTService.FEED = 6;
RESTService.PET = 7;
RESTService.PLAY = 8;
RESTService.INIT_GAME = 9;
RESTService.RENAME_PET = 10;
RESTService.LINKS = [
	{
		name: "allPets",
		itemType: "JSON",
		url: "pets",
		verb: "GET"
	},
	{
		name: "onePet",
		itemType: "JSON",
		url: "pets/",
		verb: "GET"
	},
	{
		name: "buyPet",
		itemType: "JSON",
		url: "petshop/",
		verb: "PUT"
	},
	{
		name: "getPetshop",
		itemType: "JSON",
		url: "petshop",
		verb: "GET"
	},
	{
		name: "getPetTypesConstants",
		itemType: "JSON",
		url: "petshop/constants",
		verb: "GET"
	},
	{
		name: "getMiufs",
		itemType: "JSON",
		url: "miufs",
		verb: "GET"
	},
	{
		name: "feedPet",
		itemType: "JSON",
		url: "/feed/",
		verb: "POST"
	},
	{
		name: "petAnimal",
		itemType: "JSON",
		url: "/pet",
		verb: "POST"
	},
	{
		name: "playWithPet",
		itemType: "JSON",
		url: "/play",
		verb: "POST"
	},
	{
		name: "init",
		itemType: "JSON",
		url: "init",
		verb: "GET"
	},
	{
		name: "rename",
		itemType: "JSON",
		url: "/rename/",
		verb: "POST"
	}
];

RESTService.BASE_LINK = "rest/GameWebService/";