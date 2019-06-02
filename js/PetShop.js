class PetItem {
	constructor(pet, ) {
		this.id = pet.id;
		this.miufs = pet.miufs;
		this.name = pet.name;
		this.type = pet.type;
		this.price = pet.price;

		if (PetItem.TEMP_COLORS.length === 0) {
			PetItem.TEMP_COLORS = JSON.parse(JSON.stringify(PetItem.COLORS));
		}

		this.color = PetItem.TEMP_COLORS.shift();

		this.image = (this.type === gameObject.DOGGOTYPE)? Pet.LOADED_IMAGES["doggo"] : Pet.LOADED_IMAGES["kitty"];
		this.initDomRepres();
	}

	initDomRepres() {
		this.domContainer = document.createElement("div");
		this.domContainer.classList.add("pet-item");

		this.radioButton = document.createElement("input");
		this.radioButton.type = "radio";
		this.radioButton.name = "pet-item-choice";
		this.domContainer.appendChild(this.radioButton);

		this.radioButton.addEventListener("click", gameObject.PetShop.activateBuy.bind(gameObject.PetShop));

		let canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
		this.domContainer.appendChild(canvas);

		canvas.width = this.image.width / PetItem.FRAMES_PER_IMAGE_WIDTH;
		canvas.height = this.image.height / PetItem.FRAMES_PER_IMAGE_HEIGHT;

		ctx.drawImage(this.image, (Pet.TOTAL_FRAMES * this.color + PetItem.IMAGE_COL) * Pet.FRAME_WIDTH,
			Pet.FRAME_HEIGHT * PetItem.IMAGE_ROW,
			Pet.FRAME_WIDTH, Pet.FRAME_HEIGHT, 0, 0, Pet.FRAME_WIDTH, Pet.FRAME_HEIGHT);

		let miufsP = document.createElement("p"), priceP = document.createElement("p");
		miufsP.innerText = "Reward Miufs = " + this.miufs;
		priceP.innerText = "Price = " + this.price;

		this.domContainer.appendChild(document.createElement("br"));
		this.domContainer.appendChild(miufsP);
		this.domContainer.appendChild(document.createElement("br"));
		this.domContainer.appendChild(priceP);
	}

	getDomRepres() {
		return this.domContainer;
	}

}

PetItem.COLORS_NO = 4;
PetItem.FRAMES_PER_IMAGE_WIDTH = 16;
PetItem.FRAMES_PER_IMAGE_HEIGHT = 5;
PetItem.IMAGE_ROW = 2;
PetItem.IMAGE_COL = 1;

PetItem.COLORS = [Pet.WHITE_PET, Pet.MAROON_PET, Pet.CREAM_PET, Pet.BLACK_PET];
PetItem.TEMP_COLORS = [];

class PetShop {
	constructor(petshopArr) {
		this.petshopArr = petshopArr;
		this.petItems = [];

		this.openerButton = document.getElementById("shop");
		this.window = null;

		this.openerButton.addEventListener("click", this.openWindow.bind(this));
	}

	openWindow() {
		this.window = document.open("petshop.html", "_blank", "width=1000,height=1000");
		this.windowReopened = true;

		this.window.onload = this.handleWindowLoad.bind(this);

		this.petItems = [];
		for (let pet of this.petshopArr) {
			this.petItems.push(new PetItem(pet));
		}
	}

	handleWindowLoad() {
		this.shopWindow = this.window.document.getElementById("shop-window");
		this.inputName = this.window.document.getElementById("new-name");
		this.buyButton = this.window.document.getElementById("shop");

		for (let petItem of this.petItems) {
			this.shopWindow.appendChild(petItem.getDomRepres());
		}
	}

	activateBuy() {
		this.inputName.disabled = false;
		this.buyButton.addEventListener("click", this.tryPurchase.bind(this));
	}

	tryPurchase() {
		let nameDiv = this.window.document.getElementById("change-name");

		if (this.windowReopened) {
			nameDiv.appendChild(document.createElement("br"));
			this.windowReopened = false;
		}

		if (!this.alertP) {
			this.alertP = document.createElement("p");

			this.alertP.style.color = "red";
		}

		if (!this.inputName.value) {
			this.alertP.innerText = "NAME CANNOT BE EMPTY!";
			nameDiv.appendChild(this.alertP);

			return;
		}

		let selectedPet, petName;
		for (let petItem of this.petItems) {
			if (petItem.radioButton.checked) {
				selectedPet = petItem;
				break;
			}
		}

		petName = this.inputName.value;

		gameObject.RESTService.buyPet((function(response) {
			if (response.ok) {
				this.handleBoughtPet(selectedPet.color, petName);
			} else {
				this.alertP.innerText = "YOU DON'T HAVE ENOUGH FUNDS TO BUY THIS PET!";
				nameDiv.appendChild(this.alertP);
			}
		}).bind(this), selectedPet.id);
	}

	handleBoughtPet(boughtPetColor, boughtPetName) {
		// first rename the new bought pet, after that add it to the array of pets
		gameObject.RESTService.renamePet(function() {
			// after renaming get the pet
			gameObject.RESTService.getPet(function (petDetail) {
				// push the new pet to the PETS array
				gameObject.PETS.push(new Pet(petDetail.name, petDetail.id, petDetail.hungry, petDetail.asleep,
					petDetail.type, petDetail.hunger, petDetail.sleepiness, petDetail.playfullness, boughtPetColor));

				localStorage.setItem(petDetail.name + petDetail.id, boughtPetColor);
			}, gameObject.PETS.length);
		}, gameObject.PETS.length, boughtPetName);

		this.window.close();
		gameObject.GUI.updateMiufs();
	}
}