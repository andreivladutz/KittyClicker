package petContainers;

import petClasses.*;
import java.util.ArrayList;

/*
    The living room keeps all our owned pets,
    the wallet we use for pet transactions
*/
public final class LivingRoom {
    private static LivingRoom instance = null;

    public static LivingRoom getLivingRoomInstance(Animal[] defaultPets, int initialMiufs) {
        if (instance == null) {
            instance = new LivingRoom(defaultPets, initialMiufs);
        }

        return instance;
    }

    public static LivingRoom getLivingRoomInstance() {
        if (instance == null) {
            System.out.println("YOU ARE TRYING TO ACCESS AN UNINITIALISED LIVING ROOM");
        }
        return instance;
    }

    Wallet ownerWallet;


    private int noDoggos, noKitties;
    private ArrayList<Animal> ownedPetsArr;

    /*
        when we init the living room
            - we already have two default pets so we move them in
            - progress has already been made and saved to file so we already have some updated pets
        also the current owned miufs are initialised:
            - with the default value (the initial one)
            - or the acquired miufs in the previous session
    */
    private LivingRoom(Animal[] defaultPets, int initialMiufs) {
        ownerWallet = Wallet.getWalletInstance(initialMiufs);

        ownedPetsArr = new ArrayList<>();

        for (Animal pet : defaultPets) {
            movePetIn(pet);
        }
    }

    synchronized public void movePetIn(Animal animalRef) {
        ownedPetsArr.add(animalRef);
        animalRef.setId(ownedPetsArr.size() - 1);

        if (animalRef instanceof Kitty) {
            noKitties++;
        }
        else if (animalRef instanceof Doggo) {
            noDoggos++;
        }
    }

    synchronized public void updatePets() {
        for (Animal pet : ownedPetsArr) {
            pet.checkState();
        }
    }

    synchronized public boolean isInBounds(int id) {
        if (id < 0 || id >= ownedPetsArr.size()) {
            System.out.println("Index is out of bounds!");

            return false;
        }

        return true;
    }

    synchronized public boolean feedPet(int id, int food) {
        if (!isInBounds(id))
            return false;

        int foodPrice = food / 5;

        Animal pet = ownedPetsArr.get(id);

        if (pet.isAsleep()) {
            System.out.println("The pet is asleep. You cannot feed it right now");

            return false;
        }

        try {
            ownerWallet.payMiufs(foodPrice);
        }
        catch(Exception e) {
            System.out.println("Not enough funds!");

            return false;
        }
        pet.feed(food);

        return true;
    }

    synchronized public boolean petAnimal(int idx) {
        if (!isInBounds(idx))
            return false;

        Animal petRef = ownedPetsArr.get(idx);
        int miufs = petRef.pet();

        if (miufs > 0) {
            System.out.println(petRef.getName() + " gave you " + miufs + " miufs");
            ownerWallet.receiveMiufs(miufs);

            printMiufs();
            return true;
        }

        return false;
    }

    synchronized public boolean playWithDoggo(int idx) {
        if (!isInBounds(idx))
            return false;

        Animal pet = ownedPetsArr.get(idx);

        if (!(pet instanceof Doggo)) {
            System.out.println("The pet you chose is not a doggo!");
            return false;
        }

        // downcasting to doggo
        return ((Doggo) pet).playWith();
    }

    synchronized public ArrayList<Animal> getPetsArr() {
        return ownedPetsArr;
    }

    synchronized public Animal getPet(int id) {
        return ownedPetsArr.get(id);
    }

    synchronized public int getMiufs() {
        return ownerWallet.getCurrentMiufs();
    }

    public void printPets() {
        for (int i = 0; i < ownedPetsArr.size(); i++) {
            Animal currentPet = ownedPetsArr.get(i);
            System.out.println(i + ". " + currentPet.getName() + ":");
            System.out.println("hunger = " + currentPet.getHunger());
            System.out.println("sleepiness = " + currentPet.getSleepiness() + "\n");
        }
    }

    public void printMiufs() {
        System.out.println("You currently have " + ownerWallet.getCurrentMiufs() + " miufs");
    }
}
