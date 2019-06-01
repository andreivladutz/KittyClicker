class GUI {
	constructor() {
		this.sideMenu = document.getElementById("side-menu");
		this.miufsMenu = document.getElementById("miufs");

		this.interactionsMenu = document.getElementById("interactions");
		this.interactionsMenu.style.display = "";

		this.interactionsMenu.addEventListener("click", (function() {
			this.hideInteractionsMenu();
		}).bind(this));

		this.petDetailsMenu = document.getElementById("details");

		this.boundFeedFuncs = [];
		this.boundPetFuncs = [];
		this.boundPlayFuncs = [];
	}


	updateMiufs() {
		gameObject.RESTService.getMiufs((function (obj) {
			gameObject.currentMiufs = obj["miufs"];

			let oldMiufsP = document.getElementById("coins"), oldMiufs = 0;

			if (oldMiufsP) {
				oldMiufs = oldMiufsP.innerText;
			}

			// remove old html first
			this.miufsMenu.innerHTML = "";
			clearTimeout(this.disappearingUpdateInterval);

			let newP = document.createElement("p"), value = document.createElement("p");
			newP.innerText = "MIUFS:";
			value.innerText = gameObject.currentMiufs;
			value.id = "coins";

			this.miufsMenu.appendChild(newP);
			this.miufsMenu.appendChild(document.createElement("br"));
			this.miufsMenu.appendChild(value);
			this.miufsMenu.appendChild(document.createElement("br"));

			let deltaMiufs =  gameObject.currentMiufs - oldMiufs;

			// if it is not the first time (when we show the miufs)
			// and deltaMiufs is non-zero then show the the difference
			if (oldMiufsP && deltaMiufs !== 0) {
				let differenceMiufs = document.createElement("p");
				differenceMiufs.style.opacity = "0.8";
				differenceMiufs.style.position = "absolute";
				differenceMiufs.style.right = "2rem";
				differenceMiufs.innerText = "" + deltaMiufs;

				if (deltaMiufs > 0) {
					differenceMiufs.innerText = "+" + differenceMiufs.innerText;
					differenceMiufs.style.color = "green";
				}
				else {
					differenceMiufs.style.color = "red";
				}

				this.miufsMenu.appendChild(differenceMiufs);

				let rect = differenceMiufs.getBoundingClientRect();
				differenceMiufs.style.top = (rect.top - GUI.DIFFERENCE_TOP_OFFSET) + "px";

				this.disappearingUpdateInterval = setInterval((function() {
					let currOpacity = parseFloat(differenceMiufs.style.opacity) - 0.1;

					if (currOpacity < 0) {
						if (differenceMiufs.parentNode === this.miufsMenu) {
							this.miufsMenu.removeChild(differenceMiufs);
						}

						clearInterval(this.disappearingUpdateInterval);
					}

					differenceMiufs.style.opacity = currOpacity + "";
				}).bind(this), GUI.MIUFS_DIFFERENCE_INTERVAL);
			}

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

		clearInterval(this.updatePetDetailsInterval);

		this.pushDetails(pet);
		this.updatePetDetailsInterval = setInterval(this.pushDetails.bind(this, pet), GUI.UPDATE_PET_DETAILS_INTERVAL);
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

		if (!this.interactionInterval || text !== this.interactionBox.getElementsByTagName("P")[0].innerHTML) {
			let p = document.createElement("P");
			p.innerHTML = text;
			console.log("CHANGING TEXT WITH " + text);

			this.interactionBox.innerHTML = "";
			this.interactionBox.appendChild(p);
			this.interactionBox.style.opacity = "1";

			document.body.appendChild(this.interactionBox);

			if (this.interactionInterval) {
				clearInterval(this.interactionInterval);
			}

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
			}, GUI.SHOW_NO_INTERACTION_TIME, this);
		}
		else {
			this.interactionBox.opacity = 1;
		}
	}

	bindInteractions(pet) {
		function callback(response) {
			console.log(response);
			if (response.ok) {
				gameObject.GUI.updateMiufs();
			} else {
				gameObject.GUI.showCouldNotInteract(response["answer"]);
			}
		}

		this.boundFeed = gameObject.RESTService.feedPet.bind(gameObject.RESTService, callback, pet.id, 5);
		this.boundPet = gameObject.RESTService.petAnimal.bind(gameObject.RESTService, callback, pet.id);
		this.boundPlayWith = gameObject.RESTService.playWithPet.bind(gameObject.RESTService, callback, pet.id);

		// unbind old listeners first
		this.unbindInteractions();

		this.boundFeedFuncs.push(this.boundFeed);
		this.boundPetFuncs.push(this.boundPet);
		this.boundPlayFuncs.push(this.boundPlayWith);

		document.getElementById("feed").addEventListener("click", this.boundFeed);
		document.getElementById("pet").addEventListener("click", this.boundPet);
		document.getElementById("play").addEventListener("click", this.boundPlayWith);
	}

	unbindInteractions() {
		for (let boundFeed of this.boundFeedFuncs) {
			document.getElementById("feed").removeEventListener("click", boundFeed);
		}
		for (let boundPet of this.boundPetFuncs) {
			document.getElementById("pet").removeEventListener("click", boundPet);
		}
		for (let boundPlayWith of this.boundPlayFuncs) {
			document.getElementById("play").removeEventListener("click", boundPlayWith);
		}

		this.boundFeedFuncs = [];
		this.boundPetFuncs = [];
		this.boundPlayFuncs = [];
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
GUI.SHOW_NO_INTERACTION_TIME = 500;

GUI.UPDATE_PET_DETAILS_INTERVAL = 500;
GUI.DIFFERENCE_TOP_OFFSET = 16;
GUI.MIUFS_DIFFERENCE_INTERVAL = 200;