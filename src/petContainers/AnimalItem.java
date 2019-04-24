package petContainers;
import petClasses.*;

/*
    a class that keeps a pet item in the petShop
*/
public final class AnimalItem {
    Animal initedPet;

    public enum Type {
      KITTY,
      DOGGO
    };

    Type petType;

    // price in miufs
    int price;

    public AnimalItem(String name, int miufs, Type petType, int price) {
        if (petType == Type.KITTY) {
            initedPet = new Kitty(name, miufs);
        }
        else if (petType == Type.DOGGO) {
            initedPet = new Doggo(name, miufs);
        }

        this.petType = petType;
        this.price = price;
    }

    public AnimalItem(Animal initedPet, int price) {
        this.initedPet = initedPet;

        if (initedPet instanceof Doggo) {
            this.petType = Type.DOGGO;
        }
        else if (initedPet instanceof Kitty) {
            this.petType = Type.KITTY;
        }

        this.price = price;
    }

    public Animal getPet() {
        return initedPet;
    }

    public Type getPetType() {
        return petType;
    }

    public int getPrice() {
        return price;
    }
}
