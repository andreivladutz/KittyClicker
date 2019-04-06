package petClasses;

public class Kitty extends Animal {
    {
        // update sleepiness and hunger every two and a half seconds
        updateNeedsInterval = 2500;
        // fall asleep every 10 * 2500 = 25 seconds
        sleepinessThreshold = 10;
        // a kitty sleeps 2 minutes
        sleepTotalTime = 2 * 60 * 1000;
    }

    public Kitty (String name, int miufs) {
        super(name, miufs);
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
