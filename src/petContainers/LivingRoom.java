package petContainers;

import petClasses.*;
import java.util.ArrayList;

/*
    The living room keeps all our owned pets,
    the wallet we use for pet transactions
*/
public final class LivingRoom {
    private static LivingRoom instance = null;

    public static LivingRoom getLivingRoomInstance(Animal[] defaultPets) {
        if (instance == null) {
            instance = new LivingRoom(defaultPets);
        }

        return instance;
    }

    Wallet ownerWallet;


    private int noDoggos, noKitties;
    private ArrayList<Animal> ownedPetsArr;

    /*
        when we init the living room we already have two default pets so we move them in
    */
    private LivingRoom(Animal[] defaultPets) {
        ownerWallet = Wallet.getWalletInstance();

        ownedPetsArr = new ArrayList<Animal>();

        for (Animal pet : defaultPets) {
            movePetIn(pet);
        }
    }

    public void movePetIn(Animal animalRef) {
        ownedPetsArr.add(animalRef);

        if (animalRef instanceof Kitty) {
            noKitties++;
        }
        else if (animalRef instanceof Doggo) {
            noDoggos++;
        }
    }

    public void updatePets() {
        for (Animal pet : ownedPetsArr) {
            pet.checkState();
        }
    }

    public boolean isInBounds(int id) {
        if (id < 0 || id >= ownedPetsArr.size()) {
            System.out.println("Index is out of bounds!");

            return false;
        }

        return true;
    }

    public void feedPet(int id, int food) {
        if (!isInBounds(id))
            return;

        int foodPrice = food / 5;

        Animal pet = ownedPetsArr.get(id);

        if (pet.isAsleep()) {
            System.out.println("The pet is asleep. You cannot feed it right now");

            return;
        }

        try {
            ownerWallet.payMiufs(foodPrice);
        }
        catch(Exception e) {
            System.out.println("Not enough funds!");

            return;
        }
        pet.feed(food);
    }

    public void petAnimal(int idx) {
        if (!isInBounds(idx))
            return;

        Animal petRef = ownedPetsArr.get(idx);
        int miufs = petRef.pet();

        if (miufs > 0) {
            System.out.println(petRef.getName() + " gave you " + miufs + " miufs");
            ownerWallet.receiveMiufs(miufs);

            printMiufs();
        }
    }

    public void playWithDoggo(int idx) {
        if (!isInBounds(idx))
            return;

        Animal pet = ownedPetsArr.get(idx);

        if (!(pet instanceof Doggo)) {
            System.out.println("The pet you chose is not a doggo!");
            return;
        }

        // downcasting to doggo
        ((Doggo) pet).playWith();;
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
