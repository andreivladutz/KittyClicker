package petClasses;

public class Doggo extends Animal {
    int playfulness;
    boolean bored;

    // when playfulness >= 2 doggo becomes bored
    protected static int playfulnessThreshold = 2;

    {
        // update sleepiness, playfulness and hunger every five seconds
        updateNeedsInterval = 5000;
        // fall asleep every 10 * 5000 = 50 seconds
        sleepinessThreshold = 10;
        // a doggo sleeps 5 minutes
        sleepTotalTime = 5 * 60 * 1000;
    }

    public Doggo(String name, int miufs) {
        super(name, miufs);
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

    public void playWith() {
        System.out.println("Playing with " + name);

        bored = false;
        playfulness = 0;
    }

    public void checkState() {
        super.checkState();

        if (!asleep && System.currentTimeMillis() - lastNeedsUpdate >= updateNeedsInterval) {
            playfulness++;
        }

        if (!bored &&  !asleep && playfulness >= playfulnessThreshold) {
            bored = true;
            System.out.println(name + " is bored! Play with it!");
        }
    }
}
