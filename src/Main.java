import petClasses.*;
import petContainers.*;
import ioClasses.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Timer;
import java.util.TimerTask;
import java.util.Scanner;
import java.io.File;

public class Main {
    static final String purchasedPetsFilePath = "data/purchasedPets.csv";
    static final String ownedMiufsFilePath = "data/ownedMiufs.csv";
    static final String petShopItemsFilePath = "data/petItems.csv";

    static final Animal[] defaultPets = new Animal[]{
            new Doggo("Sparky", 5),
            new Kitty("Twinkles", 10)
    };
    static final AnimalItem[] defaultPetItems = {
            new AnimalItem("Doggo1", 10, AnimalItem.Type.DOGGO, 50),
            new AnimalItem("Doggo2", 25, AnimalItem.Type.DOGGO, 150),
            new AnimalItem("Doggo3", 50, AnimalItem.Type.DOGGO, 300),
            new AnimalItem("Kitty1", 20, AnimalItem.Type.KITTY, 75),
            new AnimalItem("Kitty2", 45, AnimalItem.Type.KITTY, 200),
            new AnimalItem("Kitty3", 100, AnimalItem.Type.KITTY, 350),
    };

    static final int defaultMiufs = 10;

    // every 5 seconds we write the updates to the pets we own in the file to save progress
    static final long updatePurchasedPetsInterval = 5000;
    static long lastPurchasedPetsUpdate = 0;

    static LivingRoom livingRoomInstace;
    static PetShop petShopInstance;

    public static void main(String[] args) {
        // the living room should be inited before the pet shop!
        initLivingRoom();
        initPetShop();

        lastPurchasedPetsUpdate = System.currentTimeMillis();

        Timer t = new Timer();

        // set a scheduler to update the game at 16 ms interval => 60 FPS for animations
        t.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                Main.update();
            }
        }, 0, 16);

        textMenu();
    }

    /*
        The update method:
            - updates the status of each pet: hunger, sleepiness, playfulness, etc.
            - writes the status of each pet to file regularly
    */
    public static void update() {
        livingRoomInstace.updatePets();

        // time to write progress to file
        if (System.currentTimeMillis() - lastPurchasedPetsUpdate >= updatePurchasedPetsInterval) {
            lastPurchasedPetsUpdate = System.currentTimeMillis();

            writeProgressToFile();
        }
    }

    public static void textMenu() {
        System.out.println("Choose option:");
        System.out.println("1.See pets details");
        System.out.println("2.Feed pet");
        System.out.println("3.Pet animal");
        System.out.println("4.Play with doggo");
        System.out.println("5.Show miufs");
        System.out.println("6.Buy pets");

        Scanner in = new Scanner(System.in);

        int option = in.nextInt();

        switch(option) {
            case 1:
                printPets(); break;
            case 2: {
                System.out.println("Insert the index of the pet:");

                int idx = in.nextInt();

                System.out.println("Choose food portion");
                System.out.println("5 food = 1 miufs / 10 food = 2 miufs, etc");

                int food = in.nextInt();

                livingRoomInstace.feedPet(idx, food);
                break;
            }
            case 3: {
                System.out.println("Insert the index of the pet:");

                int idx = in.nextInt();

                livingRoomInstace.petAnimal(idx);
                break;
            }
            case 4: {
                System.out.println("Insert the index of the doggo:");

                int idx = in.nextInt();

                livingRoomInstace.playWithDoggo(idx);
                break;
            }
            case 5: {
                livingRoomInstace.printMiufs();
                break;
            }
            case 6: {
                petShopInstance.showPetItems();

                System.out.println("Choose the index of the desired pet:");
                int idx = in.nextInt();

                try {
                    petShopInstance.buyPet(idx);
                    writeProgressToFile();
                }
                catch(IndexOutOfBoundsException e) {
                    System.out.println(e.getMessage());
                }
            }
        }

        textMenu();
    }

    public static void printPets() {
        livingRoomInstace.printPets();
    }

    public static void initPetShop() {
        PetsIOHandler ioHandler = new PetsIOHandler();

        String[] lineFormatTypes = {
                "int", "string", "int", "int"
        };

        boolean fileExists = new File(petShopItemsFilePath).isFile();

        // the first time we run the program
        // or if it has the wrong format we create the file
        if (!fileExists || !(new CSVReader(petShopItemsFilePath)).verifyFormat(lineFormatTypes)) {
            if (fileExists) {
                System.out.println("The file is corrupt. Rewriting it with its default values");
            }

            ioHandler.openOut(petShopItemsFilePath, false);

            for (AnimalItem petItem: defaultPetItems) {
                try {
                    ioHandler.writeAnimalItem(petItem);
                } catch (IOException e) {
                    System.out.println(e.getMessage());
                }
            }

            ioHandler.closeOut();
        }

        ArrayList<AnimalItem> petItems = new ArrayList<>();
        AnimalItem petItem;

        ioHandler.openIn(petShopItemsFilePath);

        try {
            // while we read pet items from the input file
            while ((petItem = ioHandler.readAnimalItem()) != null) {
                petItems.add(petItem);
            }
        }
        catch (IOException e) {
            System.out.println(e.getMessage());
        }

        ioHandler.closeIn();

        // the pet shop constructor accepts an Animal array so we have to apply conversion from ArrayList<Animal>
        AnimalItem[] petItemsArr = new AnimalItem[petItems.size()];
        petShopInstance = PetShop.getPetShopInstance(petItems.toArray(petItemsArr), livingRoomInstace);
    }

    public static void initLivingRoom() {
        PetsIOHandler ioHandler = new PetsIOHandler();

        // the format that accepts kitties
        String[] lineFormatTypes1 = {
                "int", "string", "int", "int", "int"
        };
        // the format that accepts doggos
        String[] lineFormatTypes2 = {
                "int", "string", "int", "int", "int", "int"
        };

        String[][] lineFormatsArr = {
                lineFormatTypes2,
                lineFormatTypes1
        };

        boolean fileExists = new File(purchasedPetsFilePath).isFile();

        /*
         *  check to see if a file with already purchased pets exists
         *  if a file hasn't been created yet or if it has the wrong format
         *  we create one with the default pets
         */
        if (!fileExists || !(new CSVReader(purchasedPetsFilePath)).verifyFormat(lineFormatsArr)) {
            // file does exist but doesn't respect the correct format
            if (fileExists) {
                System.out.println("Your purchasedPets file is corrupt. Rewriting it with the default values");
            }
            // the file doesn't exist so we create one
            ioHandler.openOut(purchasedPetsFilePath, false);

            for (Animal pet: defaultPets) {
                try {
                    ioHandler.writePet(pet);
                }
                catch (IOException e) {
                    // never gets here if the user has write access. output stream has been opened
                    System.out.println("The user probably doesn't have write access");
                }
            }

            ioHandler.closeOut();
        }

        String[] miufsCorrectFormat = {"int"};
        boolean miufsFileExists = new File(ownedMiufsFilePath).isFile();

        // does the file already exist? is it correctly written?
        if (!miufsFileExists || !(new CSVReader(ownedMiufsFilePath)).verifyFormat(miufsCorrectFormat)) {
            ioHandler.openOut(ownedMiufsFilePath, false);

            ioHandler.getOutCSVWriter().writeInt(defaultMiufs, true);

            ioHandler.closeOut();
        }

        ArrayList<Animal> purchasedPets = new ArrayList<>();
        Animal pet;

        ioHandler.openIn(purchasedPetsFilePath);

        try {
            // while we read pets from the input file
            while ((pet = ioHandler.readPet()) != null) {
                purchasedPets.add(pet);
            }
        }
        catch (IOException e) {
            System.out.println(e.getMessage());
        }

        ioHandler.closeIn();


        int currentMiufs;
        ioHandler.openIn(ownedMiufsFilePath);

        ioHandler.getInCSVReader().readLine();

        try {
            currentMiufs = ioHandler.getInCSVReader().nextInt();
        } catch(IOException e) {
            // no int is written in the file
            currentMiufs = defaultMiufs;
        }

        // livingRoom constructor expects an Animal array so we have to convert the purchasedPets ArrayList
        Animal[] animalArr = new Animal[purchasedPets.size()];
        livingRoomInstace = LivingRoom.getLivingRoomInstance(purchasedPets.toArray(animalArr), currentMiufs);
    }

    public static void writeProgressToFile() {
        PetsIOHandler ioHandler = new PetsIOHandler();
        ioHandler.openOut(purchasedPetsFilePath, false);

        ArrayList<Animal> petsArr = livingRoomInstace.getPetsArr();

        for (int i = 0; i < petsArr.size(); i++) {
            try {
                ioHandler.writePet(petsArr.get(i));
            } catch (IOException e) {
                System.out.println(e.getMessage());
            }
        }

        ioHandler.closeOut();

        ioHandler.openOut(ownedMiufsFilePath, false);
        ioHandler.getOutCSVWriter().writeInt(livingRoomInstace.getMiufs(), true);
        ioHandler.closeOut();
    }
}
