package petContainers;

import ioClasses.CSVWriter;
import petClasses.Animal;

public final class PetShop
{
    private static PetShop instance = null;

    public static PetShop getPetShopInstance(AnimalItem[] pets, LivingRoom livingRoomInst) {
        if (instance == null) {
            instance = new PetShop(pets, livingRoomInst);
        }

        return instance;
    }

    // will be a sorted collection by price
    private AnimalItem[] petItems;
    private Wallet walletInstance;
    private LivingRoom livingRoomInstance;

    private String transactionsFilePath = "data/petTransactions.csv";

    // we copy the pet items in the main array
    private PetShop(AnimalItem[] pets, LivingRoom livingRoomInst) {
        petItems = new AnimalItem[pets.length];

        for (int i = 0; i < pets.length; i++) {
            petItems[i] = pets[i];
        }

        try {
            walletInstance = Wallet.getWalletInstance();
        } catch(NullPointerException e) {
            System.out.println(e.getMessage());
        }
        livingRoomInstance = livingRoomInst;
    }

    public void buyPet(int id) throws IndexOutOfBoundsException {
        if (id < 0 || id >= petItems.length) {
            throw new IndexOutOfBoundsException("Id not valid");
        }

        AnimalItem petItem = petItems[id];
        /*
            buying the pet
            payMiufs checks if we have enough funds first and throws exception if we don't
        */
        CSVWriter out = new CSVWriter(transactionsFilePath, true);
        try {
            walletInstance.payMiufs(petItem.price);
            out.writeString("bought_pet_id = " + id, false);
            out.writeLong(System.currentTimeMillis(), true);
        }
        catch(Exception e) {
            // if we don't have enough funds we exit
            System.out.println("You don't have enough funds!!");
            return;
        }
        finally {
            out.close();
        }

        livingRoomInstance.movePetIn(petItem.initedPet);
    }

    public void showPetItems() {
        for (int i = 0; i < petItems.length; i++) {
            AnimalItem currPetItem = petItems[i];

            System.out.print(i + ". ");

            if (currPetItem.getPetType() == AnimalItem.Type.DOGGO) {
                System.out.print("Doggo: ");
            }
            else {
                System.out.print("Kitty: ");
            }

            System.out.print("reward_miufs = " + currPetItem.initedPet.getMiufs() + " ");
            System.out.println("price = " + currPetItem.price);
        }
    }
}
