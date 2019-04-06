package petContainers;

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

    // we copy the pet items in the main array
    private PetShop(AnimalItem[] pets, LivingRoom livingRoomInst) {
        petItems = new AnimalItem[pets.length];

        for (int i = 0; i < pets.length; i++) {
            petItems[i] = pets[i];
        }

        walletInstance = Wallet.getWalletInstance();
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
        try {
            walletInstance.payMiufs(petItem.price);
        }
        catch(Exception e) {
            // if we don't have enough funds we exit
            System.out.println("You don't have enough funds!!");
            return;
        }

        livingRoomInstance.movePetIn(petItem.initedPet);
    }
}
