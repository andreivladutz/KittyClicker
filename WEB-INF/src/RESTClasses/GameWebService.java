package RESTClasses;

import petContainers.AnimalItem;
import petContainers.LivingRoom;
import petContainers.PetShop;

import javax.print.attribute.standard.Media;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.List;
import java.util.stream.Collectors;

@Path("/GameWebService")
public class GameWebService {
    private final LivingRoom livingRoom = LivingRoom.getLivingRoomInstance();
    private final PetShop petShop = PetShop.getPetShopInstance();

    /*
        GETTING ALREADY BOUGHT PETS (WHICH ARE DRAWN IN THE LIVING ROOM)
     */

    @GET
    @Path("/pets")
    @Produces(MediaType.APPLICATION_JSON)
    public List<PetState> getPets() {
        List<PetState> petStates;

        // make sure we don't have any other thread accessing livingRoom instance
        synchronized (livingRoom) {
            // for each animal create its state object and collect all the pet states to a list
            petStates = livingRoom.getPetsArr().stream().map(PetState::new).collect(Collectors.toList());
        }

        return petStates;
    }

    @GET
    @Path("/pets/{pet_id}")
    @Produces(MediaType.APPLICATION_JSON)
    public PetState getPet(@PathParam("pet_id") int id) {
        synchronized (livingRoom) {
            return new PetState(livingRoom.getPet(id));
        }
    }

    /*
        BUYING PETS / GETTING PET SHOP CONTENTS
     */
    @PUT
    @Path("/petshop/{pet_id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String buyPet(@PathParam("pet_id") int id) {
        boolean couldBuy;

        synchronized (petShop) {
            couldBuy = petShop.buyPet(id);
        }

        // IF WE HAVE ENOUGH MIUFS WE WILL BE ABLE TO BUY THE PET
        // OTHERWISE FALSE WILL BE RETURNED
        return "{\"ok\": " + couldBuy + "}";
    }

    @GET
    @Path("/petshop")
    @Produces(MediaType.APPLICATION_JSON)
    public List<PetItemState> getPetshopItems() {
        List<PetItemState> petShopStateItems;

        synchronized (petShop) {
            List<AnimalItem> petShopItems = petShop.getPetItems();

            // the same as in getPets -> we get a list of parsable to JSON items
            petShopStateItems = petShopItems.stream().map(animalItem -> new PetItemState(animalItem, petShopItems.indexOf(animalItem)))
                    .collect(Collectors.toList());
        }

        return petShopStateItems;
    }

    // get the constants for kitty and doggo types
    @GET
    @Path("/petshop/constants")
    @Produces(MediaType.APPLICATION_JSON)
    public String getPetItemsConstants() {
        return "{\"doggo\":" + PetItemState.getDoggoType() + ", \"kitty\":" + PetItemState.getKittyType() + "}";
    }

    // get the current miufs
    @GET
    @Path("/miufs")
    @Produces(MediaType.APPLICATION_JSON)
    public String getMiufs() {
        synchronized (livingRoom) {
            return "{\"miufs\":" + livingRoom.getMiufs() + "}";
        }
    }

    // feed pet
    @POST
    @Path("/pets/{pet_id}/feed/{food_portion}")
    @Produces(MediaType.APPLICATION_JSON)
    public InteractionAnswer feedPet(@PathParam("pet_id") int petId, @PathParam("food_portion") int foodPortion) {
        synchronized (livingRoom) {
            return livingRoom.feedPet(petId, foodPortion);
        }
    }

    // pet animal
    @POST
    @Path("/pets/{pet_id}/pet")
    @Produces(MediaType.APPLICATION_JSON)
    public InteractionAnswer pet(@PathParam("pet_id") int petId) {
        synchronized (livingRoom) {
            return livingRoom.petAnimal(petId);
        }
    }

    @POST
    @Path("/pets/{pet_id}/rename/{pet_name}")
    @Produces(MediaType.APPLICATION_JSON)
    public String rename(@PathParam("pet_id") int petId, @PathParam("pet_name") String petName) {
        synchronized (livingRoom) {
            livingRoom.renamePet(petId, petName);
        }

        return "{\"ok\": true}";
    }

    // play with doggo
    @POST
    @Path("/pets/{pet_id}/play")
    @Produces(MediaType.APPLICATION_JSON)
    public InteractionAnswer playWithDoggo(@PathParam("pet_id") int petId) {
        synchronized (livingRoom) {
            return livingRoom.playWithDoggo(petId);
        }
    }
}
