package RESTClasses;

import petClasses.Animal;
import petClasses.Doggo;
import petClasses.Kitty;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "pet")
public class PetState {
    // codified types of pets
    private static final int kittyType = 0, doggoType = 1;
    private int id, type, hunger, sleepiness, playfullness;
    private String name;
    private boolean asleep, hungry;

    PetState(Animal animalRef) {
        synchronized (animalRef) {
            id = animalRef.getId();
            name = animalRef.getName();
            asleep = animalRef.isAsleep();

            if (animalRef instanceof Doggo) {
                type = doggoType;
                playfullness = ((Doggo) animalRef).getPlayfulness();
            }
            if (animalRef instanceof Kitty) {
                type = kittyType;
                playfullness = -1;
            }

            sleepiness = animalRef.getSleepiness();
            hunger = animalRef.getHunger();
            hungry = animalRef.isHungry();
        }
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public boolean isAsleep() {
        return asleep;
    }

    public boolean isHungry() {
        return hungry;
    }

    public int getType() {
        return type;
    }

    public int getHunger() {
        return hunger;
    }

    public int getSleepiness() {
        return sleepiness;
    }

    public int getPlayfullness() {
        return playfullness;
    }
}
