package petClasses;

public class Kitty extends Animal {
    {
        // update sleepiness and hunger every 30 secs
        updateNeedsInterval = 30 * 1000;
        // fall asleep every 2 * 30 sec * 3 = 3 mins
        sleepinessThreshold = 6;
        // a kitty sleeps 1 minutes
        sleepTotalTime = 60 * 1000;
    }

    public Kitty (String name, int miufs) {
        super(name, miufs);
    }

    public Kitty(String name, int miufs, int hunger, int sleepiness) {
        super(name, miufs, hunger, sleepiness);
    }

    // a kitty might return miufs or not depending on its mood to be pet
    @Override
    public int receiveMiufs() {
        double mood = Math.random();

        if (mood > 0.5) {
            System.out.println(name + " is not in the mood to be pet!");
            return 0;
        }
        else {
            System.out.println("Petting " + name);
            return miufs;
        }
    }
}
