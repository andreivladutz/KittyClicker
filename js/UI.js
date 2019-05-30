class GUI {
	constructor() {
		this.sideMenu = document.getElementById("side-menu");
		this.miufsMenu = document.getElementById("miufs");

		this.interactionsMenu = document.getElementById("interactions");
		this.interactionsMenu.style.display = "";

		this.petDetailsMenu = document.getElementById("details");
	}


	updateMiufs() {
		gameObject.RESTService.getMiufs((function (obj) {
			gameObject.currentMiufs = obj.miufs;

			// remove old html first
			this.miufsMenu.innerHTML = "";

			let newP = document.createElement("p"), value = document.createElement("p");
			newP.innerText = "MIUFS:";
			value.innerText = gameObject.currentMiufs;
			value.id = "coins";

			this.miufsMenu.appendChild(newP);
			this.miufsMenu.appendChild(document.createElement("br"));
			this.miufsMenu.appendChild(value);
		}).bind(this));
	}

	showInteractions(pet) {
		this.petThatOpenedInteraction = pet;

		let petCoords = gameObject.mapRenderer.mapCoordsToScreenCoords(pet);

		this.interactionsMenu.style.display = "block";
		this.interactionsMenu.style.left = petCoords.x + Pet.FRAME_WIDTH / 2 + "px";
		this.interactionsMenu.style.top = petCoords.y - Pet.FRAME_HEIGHT + "px";

		let playDiv = document.getElementById("play");
		// cannot play with the kitty
		if (pet.type === gameObject.KITTYTYPE) {
			playDiv.style.display = "none";
		}
		else {
			playDiv.style.display = "";
		}
		
		this.bindInteractions(pet);
		this.pushDetails(pet);
	}

	hideInteractionsMenu() {
		this.petThatOpenedInteraction && (this.petThatOpenedInteraction.openedWindow = false);
		this.interactionsMenu.style.display = "";

		this.unbindInteractions();
	}

	showCouldNotInteract(text) {
		/*
			Just showing a DOM div a.k.a. a box with a text so the player knows to press "E" to interact
		 */
		if (!this.interactionBox) {
			this.interactionBox = document.createElement("DIV");
			this.interactionBox.id = "interaction-box";
		}
		let timeFromLastShown = 0;

		if (this.interactionBoxShownTimer === undefined) {
			this.interactionBoxShownTimer = new Timer();
			timeFromLastShown = GUI.INTERACTION_BOX_TIME;
		}
		else {
			timeFromLastShown = this.interactionBoxShownTimer.getDeltaTime();
			this.interactionBoxShownTimer.resetTimeNow();
		}

		if (timeFromLastShown < GUI.INTERACTION_BOX_TIME ) {
			return;
		}

		this.interactionBoxShownTimer.lastUpdatedNow();

		if (!this.interactionInterval || text !== this.interactionBox.getElementsByTagName("P")[0].innerText) {
			let p = document.createElement("P");
			p.innerText = text;

			this.interactionBox.innerHTML = "";
			this.interactionBox.appendChild(p);
			this.interactionBox.style.opacity = "1";

			document.body.appendChild(this.interactionBox);

			this.interactionInterval = setInterval(function(self) {
				let currOpacity = String(parseFloat(self.interactionBox.style.opacity) - 0.1);

				//console.log(currOpacity)
				if (currOpacity > 0) {
					self.interactionBox.style.opacity = currOpacity;
				}
				else {
					clearInterval(self.interactionInterval);
					self.interactionInterval = null;

					document.body.removeChild(self.interactionBox);
				}
			}, 200, this);
		}
		else {
			this.interactionBox.opacity = 1;
		}
	}

	bindInteractions(pet) {
		function callback(response) {
			if (response.ok) {
				gameObject.GUI.updateMiufs();
			} else {
				gameObject.GUI.showCouldNotInteract("Could not interact with the pet");
			}
		}

		this.boundFeed = gameObject.RESTService.feedPet.bind(gameObject.RESTService, callback, pet.id, 5);
		this.boundPet = gameObject.RESTService.petAnimal.bind(gameObject.RESTService, callback, pet.id);
		this.boundPlayWith = gameObject.RESTService.playWithPet.bind(gameObject.RESTService, callback, pet.id);

		document.getElementById("feed").addEventListener("click", this.boundFeed);
		document.getElementById("pet").addEventListener("click", this.boundPet);
		document.getElementById("play").addEventListener("click", this.boundPlayWith);

		this.interactionsMenu.addEventListener("click", (function() {
			this.hideInteractionsMenu();
		}).bind(this));
	}

	unbindInteractions() {
		document.getElementById("feed").removeEventListener("click", this.boundFeed);
		document.getElementById("pet").removeEventListener("click", this.boundPet);
		document.getElementById("play").removeEventListener("click", this.boundPlayWith);
	}

	pushDetails(pet) {
		pet.requestUpdate((function() {
			let props = ["hunger", "sleepiness", "playfullness"];

			this.petDetailsMenu.innerText = "Pet Details: " + pet.name;

			for (let prop of props) {
				let p = document.getElementById(prop);

				if (!p) {
					p = document.createElement("p");
					p.id = prop;

					this.petDetailsMenu.appendChild(p);
				}

				p.style.display = "";
				p.innerText = prop + ": " + pet[prop];
			}

			if (pet.type === gameObject.KITTYTYPE) {
				document.getElementById("playfullness").style.display = "none";
			}
		}).bind(this));
	}
}

GUI.INTERACTION_BOX_TIME = 750;