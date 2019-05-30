class ResourceLoaderBase extends EventEmiter {
	constructor() {
		super();
		this.totalItems = 0;
		
		this._resources = [];
		this._resourceObjects = {};
		
		//array of promises to wait on so we know
		//when all resources finished loading
		this._loadingPromises = [];
	}
}

_p = ResourceLoaderBase.prototype;

/*
	obj = obiectul ce va fi incarcat
	onLoadedSetter = functia asincron ce apeleaza resolve la incarcare
	onFailSetter = functia asincron ce apeleaza reject cu o eroare la incarcare
	beginLoading = functia ce incepe incarcarea asincron
*/
_p._addItem = function(obj, onLoadedSetter, onFailSetter, beginLoading) {
	this._resources.push({
		resourceObject : obj,
		onLoadedSetter, 
		onFailSetter, 
		beginLoading
	});
	
	this.totalItems++;
}

_p.updateProgress = function(loadedItems, totalItemsToLoad) {
	console.log ("Loaded " + loadedItems + " out of " + totalItemsToLoad);
}

/*
	pentru fiecare dintre resurse apelez seterele ce vor apela asincron
		resolve -> daca s-au incarcat cu succes
		reject -> daca a esuat incarcarea
	si declansez incarcarea
	
	in primul lant then apelez handlere-le pentru incarcare/eroare a resursei
	in al doilea lant then afisez erori la consola sau in caz de reusita
	updatez bara de incarcare  
*/
_p.load = function(resourcesName = "") {
	// nothing to load
	if (!this._resources.length) {
		return;
	}

	let loadedItems = 0, totalItemsToLoad = 0;
	
	let self = this;
	
	for (let i = 0; i < this._resources.length; i++) {
		//daca aceasta resursa a fost incarcata deja sarim peste ea
		if (this._resources[i].resourceObject._availableResource)
			continue;
		
		totalItemsToLoad++;
		
		let currRes = this._resources[i];
		
		this._loadingPromises.push(
			new Promise(function(resolve, reject) {
				currRes.onLoadedSetter(resolve);
				currRes.onFailSetter(reject);

				currRes.beginLoading();
			}).then(
				function fulfillment(response) {
					++loadedItems;
					self.updateProgress(loadedItems, totalItemsToLoad);
					
					// handlere apelate pt cand resursa s-a incarcat
					response.loadedObject._availableResource = true;
					self.emit("loaded" + response.resourceName, response.loadedObject);
				},
				function rejection(response) {
					// handlere apelate pt cand resursa nu a reusit sa se incarce
					self.emit("error" + response.resourceName, response.error);
					
					throw response.error;
				}
			)
		);
	}
	
	this.updateProgress(loadedItems, totalItemsToLoad);
	
	Promise.all(this._loadingPromises).then(
		function() {
			self.emit("finishedLoading" + resourcesName, null);
		},
		function(err) {
			self.emit("errorLoading" + resourcesName, err);
		}
	);
}

/*
	we want to have different resourceLoaders for
	different classes but move loaded objects to a global resourceLoader
*/
_p.moveResourcesTo = function(resLoader) {
	for (let resName in this._resourceObjects) {
		let resource = this._resourceObjects[resName];
		
		if (!resource._availableResource) {
			throw new Error("You're trying to move a resource that hasn't been loaded yet!");
			
			return;
		}
		
		if (resLoader._resourceObjects[resName]) {
			//throw new Error("You're trying to move a resource to a resourceLoader that has a name collision with your resource");
			
			return;
		}
		
		resLoader._resourceObjects[resName] = resource;
	}
}

class ResourceLoader extends ResourceLoaderBase {
	constructor() {
		super();
	}
}

_p = ResourceLoader.prototype;

/*
	loader-ul va emite obiectul Image la incarcare
*/
_p.addImage = function(name, url) {
	var img = this._resourceObjects[name] = new Image();
	img._availableResource = false;
	
	function onLoadedSetter(resolve) {
		img.onload = function() {
			resolve({
				loadedObject : this,
				resourceName : name
			});
		}
	} 
	
	function onFailSetter(reject) {
		img.onerror = function(e) {
			reject({
				error : e,
				resourceName : name
			});
		}
	} 
	
	function beginLoading() {
		img.src = url;
	}
	
	this._addItem(img, onLoadedSetter, onFailSetter, beginLoading);
}

/*
	loader-ul va emite obiectul xhttp la incarcare
	
	itemType va fi JSON sau XML
*/
_p.addXML = function(name, itemType, url, verb = "GET") {
	let xhttp = this._resourceObjects[name] = new XMLHttpRequest();
	
	if (itemType === "JSON")
		xhttp.overrideMimeType("application/json");
	
	xhttp._availableResource = false;
	
	function onLoadedSetter(resolve) {
		xhttp.onreadystatechange = function() {
			if (this.readyState === 4 && (this.status === 200 || this.status === 0))
				resolve({
					loadedObject : this,
					resourceName : name
				});
		}
	} 
	
	function onFailSetter(reject) {
		xhttp.onerror = function(e) {
			reject({
				error : e,
				resourceName : name
			});
		}
	} 
	
	function beginLoading() {
		xhttp.open(verb, url, true);
		xhttp.send();
	}
	
	this._addItem(xhttp, onLoadedSetter, onFailSetter, beginLoading);
}

/*
	name = identificator pentru obiectul incarcat(folosit la get)
	itemType = img, XML sau JSON
	url = sursa fisierului
	
	sau
	
	array de obiecte cu proprietatile acestea
*/
_p.add = function(name, itemType, url, verb = "GET") {
	if (arguments.length === 1 && (arguments[0] instanceof Array)) {
		let paramArr = arguments[0];
		
		for (var i = 0; i < paramArr.length; i++)
			if (paramArr[i].itemType === "img")
				this.addImage(paramArr[i].name, paramArr[i].url);
			else if (paramArr[i].itemType === "XML" || paramArr[i].itemType === "JSON") {
				if (paramArr[i].verb) {
					this.addXML(paramArr[i].name, paramArr[i].itemType, paramArr[i].url, paramArr[i].verb);
				}
				else {
					this.addXML(paramArr[i].name, paramArr[i].itemType, paramArr[i].url);
				}
			}
	}
	
	if (itemType === "img")
		this.addImage(name, url);
	else if (itemType === "XML" || itemType === "JSON")
		this.addXML(name, itemType, url, verb);
	
}

_p.get = function(name) {
	if (this._resourceObjects[name] && !this._resourceObjects[name]._availableResource) {
		throw new Error("You are trying to access a resource that hasn't been loaded yet!");
		return undefined;	
	}
	
	return this._resourceObjects[name];
}