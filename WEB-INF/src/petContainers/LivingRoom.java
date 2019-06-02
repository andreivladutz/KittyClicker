package petContainers;

import RESTClasses.InteractionAnswer;
import mainPackage.Main;
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
            System.out.println("YOU ARE TRYING TO ACCESS AN UNINITIALISED LIVING ROOM. INITIALISING GAME FIRST:");
            Main.initialise();
        }
        return instance;
    }

    private Wallet ownerWallet;


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

    synchronized void movePetIn(Animal animalRef) {
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

    synchronized private boolean isInBounds(int id) {
        if (id < 0 || id >= ownedPetsArr.size()) {
            System.out.println("Index is out of bounds!");

            return false;
        }

        return true;
    }

    synchronized public InteractionAnswer feedPet(int id, int food) {
        if (!isInBounds(id)) {
            return new InteractionAnswer(false, "Id is not in bounds.");
        }

        int foodPrice = food / 5;

        Animal pet = ownedPetsArr.get(id);

        if (pet.isAsleep()) {
            String answer = "The pet is asleep. You cannot feed it right now";
            System.out.println(answer);

            return new InteractionAnswer(false, answer);
        }

        try {
            ownerWallet.payMiufs(foodPrice);
        }
        catch(Exception e) {
            String answer = "Not enough funds!";
            System.out.println(answer);

            return new InteractionAnswer(false, answer);
        }
        pet.feed(food);

        return new InteractionAnswer(true, "Pet was fed");
    }

    synchronized public InteractionAnswer petAnimal(int idx) {
        if (!isInBounds(idx)) {
            return new InteractionAnswer(false, "Id is not in bounds.");
        }

        Animal petRef = ownedPetsArr.get(idx);
        int miufs = petRef.pet();

        if (miufs > 0) {
            String answer = petRef.getName() + " gave you " + miufs + " miufs";
            ownerWallet.receiveMiufs(miufs);

            printMiufs();
            return new InteractionAnswer(true, answer);
        }

        return new InteractionAnswer(false, petRef.getRefusePettingMessage());
    }

    synchronized public InteractionAnswer playWithDoggo(int idx) {
        if (!isInBounds(idx)) {
            return new InteractionAnswer(false, "Id is not in bounds.");
        }

        Animal pet = ownedPetsArr.get(idx);

        if (!(pet instanceof Doggo)) {
            String answer = "The pet you chose is not a doggo!";
            return new InteractionAnswer(false, answer);
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

    synchronized public void renamePet(int idx, String newName) {
        Animal pet = ownedPetsArr.get(idx);

        pet.setName(newName);
    }

    public void printMiufs() {
        System.out.println("You currently have " + ownerWallet.getCurrentMiufs() + " miufs");
    }
}
