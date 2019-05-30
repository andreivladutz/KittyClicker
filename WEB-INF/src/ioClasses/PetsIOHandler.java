package ioClasses;

import petClasses.*;
import petContainers.AnimalItem;

import java.io.IOException;

/*
*--------------------------------------------------------------------------
*    how pets are written to files:
*
*    TYPE        NAME        MIUFS       HUNGER      SLEEPINESS
*  (0/1 int)   (string)      (int)       (int)         (int)
*
*   where:
*
*   0 = kitty and 1 = doggo
*--------------------------------------------------------------------------
*   doggo has an extra field:
*
*   *pet part of the doggo*    PLAYFULNESS
*                                 (int)
*---------------------------------------------------------------------------
*   animalItems are written:
*    TYPE        NAME        MIUFS       PRICE
*  (0/1 int)   (string)      (int)       (int)
*---------------------------------------------------------------------------
*/
public class PetsIOHandler {
    // codified types of pets
    private static final int kittyType = 0, doggoType = 1;

    // the generic classes for .csv I/O
    private CSVReader in;
    private CSVWriter out;
    private boolean closedOut = true, closedIn = true;

    /*
        functions to open and close streams for I/O
    */

    // if append is false the opening of the output stream will overwrite the existing files
    public void openOut(String filename, boolean append) {
        // make sure old stream is closed before opening a new one
        if (!closedOut) {
            out.close();
        }
        out = new CSVWriter(filename, append);
        closedOut = false;
    }

    public void openIn(String filename) {
        if (!closedIn) {
            in.close();
        }

        in = new CSVReader(filename);
        closedIn = false;
    }

    public void closeOut() {
        // do nothing. out is already closed
        if (closedOut) {
            return;
        }

        out.close();
        closedOut = true;
    }

    public void closeIn() {
        // do nothing. in is already closed
        if (closedIn) {
            return;
        }

        in.close();
        closedIn = true;
    }

    // when writing a pet to a file we first check it's type: Doggo or Kitty
    public void writePet(Animal pet) throws IOException {
        if (closedOut) {
            throw new IOException("No out stream has been opened!");
        }

        int type = kittyType;

        if (pet instanceof Doggo) {
            type = doggoType;
        }
        else if (pet instanceof Kitty) {
            type = kittyType;
        }

        /*
         *    TYPE        NAME        MIUFS       HUNGER      SLEEPINESS     PLAYFULNESS
         *  (0/1 int)   (string)      (int)       (int)         (int)           (int)
         */

        out.writeInt(type, false);
        out.writeString(pet.getName(), false);
        out.writeInt(pet.getMiufs(), false);
        out.writeInt(pet.getHunger(), false);

        if (type == doggoType) {
            out.writeInt(pet.getSleepiness(), false);
            // first we have to downcast to Doggo to be able to get playfulness
            out.writeInt(((Doggo) pet).getPlayfulness(), true);
        }
        else if (type == kittyType) {
            out.writeInt(pet.getSleepiness(), true);
        }
    }

    public Animal readPet() throws IOException {
        if (closedIn) {
            throw new IOException("No in stream has been opened!");
        }

        int type, miufs, hunger, sleepiness;
        String name;

        /*
         *    TYPE        NAME        MIUFS       HUNGER      SLEEPINESS     PLAYFULNESS
         *  (0/1 int)   (string)      (int)       (int)         (int)           (int)
         */

        // read a raw line from the csv file
        if (!in.readLine()) {
            // there are no more lines to read in the file
            return null;
        }

        // and parse it
        type = in.nextInt();
        name = in.nextString();
        miufs = in.nextInt();
        hunger = in.nextInt();
        sleepiness = in.nextInt();

        if (type == doggoType) {
            int playfulness = in.nextInt();
            return new Doggo(name, miufs, hunger, sleepiness, playfulness);
        }

        return new Kitty(name, miufs, hunger, sleepiness);
    }

    public void writeAnimalItem(AnimalItem petItem) throws IOException {
        if (closedOut) {
            throw new IOException("No out stream has been opened!");
        }

        int type = (petItem.getPetType() == AnimalItem.Type.DOGGO)? doggoType : kittyType;

        /*------------------------------------------------
        *    TYPE        NAME        MIUFS       PRICE
        *  (0/1 int)   (string)      (int)       (int)
        *-------------------------------------------------
        */

        out.writeInt(type, false);
        out.writeString(petItem.getPet().getName(), false);
        out.writeInt(petItem.getPet().getMiufs(), false);
        out.writeInt(petItem.getPrice(), true);
    }

    public AnimalItem readAnimalItem() throws IOException {
        if (closedIn) {
            throw new IOException("No in stream has been opened!");
        }

        int type, miufs, price;
        String name;

        /*------------------------------------------------
         *    TYPE        NAME        MIUFS       PRICE
         *  (0/1 int)   (string)      (int)       (int)
         *-------------------------------------------------
         */

        // read a raw line from the csv file
        if (!in.readLine()) {
            // there are no more lines to read in the file
            return null;
        }

        // and parse it
        type = in.nextInt();
        name = in.nextString();
        miufs = in.nextInt();
        price = in.nextInt();

        if (type == doggoType) {
            return new AnimalItem(name, miufs, AnimalItem.Type.DOGGO, price);
        }

        return new AnimalItem(name, miufs, AnimalItem.Type.KITTY, price);
    }


    /*
        get the generic classes for reading and writing basic types
    */
    public CSVReader getInCSVReader() {
        return in;
    }

    public CSVWriter getOutCSVWriter() {
        return out;
    }
}
