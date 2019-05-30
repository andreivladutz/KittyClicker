package petClasses;

public class Doggo extends Animal {
    int playfulness;
    boolean bored;

    // when playfulness >= 2 doggo becomes bored
    protected static int playfulnessThreshold = 2;

    {
        // update sleepiness, playfulness and hunger every 30 seconds
        updateNeedsInterval = 30 * 1000;
        // fall asleep every 2 * 30 sec * 5 = 5 mins
        sleepinessThreshold = 10;
        // a doggo sleeps 30 secs
        sleepTotalTime = 30 * 1000;
    }

    public Doggo(String name, int miufs) {
        super(name, miufs);
    }

    public Doggo(String name, int miufs, int hunger, int sleepiness, int playfulness) {
        super(name, miufs, hunger, sleepiness);
        this.playfulness = playfulness;
    }

    @Override
    public int receiveMiufs() {
        System.out.println("Petting " + name);
        return miufs;
    }

    public int pet() {
        if (bored) {
            System.out.println(name + " is bored. You have to entertain him before petting!");

            return 0;
        }

        return super.pet();
    }

    public boolean playWith() {
        if (asleep) {
            System.out.println(name + " is asleep right now. Cannot play with it");
            return false;
        }

        System.out.println("Playing with " + name);
        System.out.println(name + " is now happy");

        bored = false;
        playfulness = 0;

        return true;
    }

    public void checkState() {
        super.checkState();

        if (!asleep && System.currentTimeMillis() - lastNeedsUpdate >= updateNeedsInterval) {
            System.out.println("playfulness = " + playfulness);
            playfulness++;
        }

        if (!bored &&  !asleep && playfulness >= playfulnessThreshold) {
            bored = true;
            System.out.println(name + " is bored! Play with it!");
        }
    }

    public int getPlayfulness() {
        return playfulness;
    }
}
