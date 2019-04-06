import petClasses.*;
import petContainers.*;

import java.util.Timer;
import java.util.TimerTask;
import java.util.Scanner;

public class Main {
    static LivingRoom livingRoomInstace;
    static PetShop petShopInstance;

    public static void main(String[] args) {
        // the living room should be inited before the pet shop!
        initLivingRoom();
        initPetShop();

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

    public static void update() {
        livingRoomInstace.updatePets();
    }

    public static void textMenu() {
        System.out.println("Choose option:");
        System.out.println("1.See pets details");
        System.out.println("2.Feed pet");
        System.out.println("3.Pet animal");
        System.out.println("4.Play with doggo");
        System.out.println("5.Show miufs");

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
        }

        textMenu();
    }

    public static void printPets() {
        livingRoomInstace.printPets();
    }

    public static void initPetShop() {
        AnimalItem [] pets = {
                new AnimalItem("Doggo1", 10, AnimalItem.Type.DOGGO, 50),
                new AnimalItem("Doggo2", 25, AnimalItem.Type.DOGGO, 150),
                new AnimalItem("Doggo3", 50, AnimalItem.Type.DOGGO, 300),
        };

        petShopInstance = PetShop.getPetShopInstance(pets, livingRoomInstace);
    }

    public static void initLivingRoom() {
        Animal[] defaultPets = new Animal[] {
                new Doggo("Sparky", 5),
                new Kitty("Twinkles", 10)
        };

        livingRoomInstace = LivingRoom.getLivingRoomInstance(defaultPets);
    }
}
