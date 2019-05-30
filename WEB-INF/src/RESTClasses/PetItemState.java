package RESTClasses;

import petClasses.Animal;
import petContainers.AnimalItem;

import javax.xml.bind.annotation.XmlRootElement;


/*  COPIED FROM THE PETS IO HANDLER CLASS
 * THIS WILL BE THE FORMAT OF A PET ITEM STATE TOO
 *------------------------------------------------
 *    TYPE        NAME        MIUFS       PRICE
 *  (0/1 int)   (string)      (int)       (int)
 *-------------------------------------------------
 */

@XmlRootElement(name = "petItem")
public class PetItemState {
    // codified types of pets
    private static final int kittyType = 0, doggoType = 1;
    // the id is the position in the petItems array from the PetShop service
    int type, miufs, price, id;
    String name;

    PetItemState(AnimalItem animalItem, int id) {
        this.id = id;
        price = animalItem.getPrice();
        type = (animalItem.getPetType() == AnimalItem.Type.DOGGO)? doggoType : kittyType;

        Animal petSold = animalItem.getPet();
        name = petSold.getName();
        miufs = petSold.getMiufs();
    }

    public static int getKittyType() {
        return kittyType;
    }

    public static int getDoggoType() {
        return doggoType;
    }

    public int getType() {
        return type;
    }

    public int getMiufs() {
        return miufs;
    }

    public int getPrice() {
        return price;
    }

    public String getName() {
        return name;
    }

    public int getId() {
        return id;
    }
}
