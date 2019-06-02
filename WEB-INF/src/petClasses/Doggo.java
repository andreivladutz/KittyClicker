package petClasses;

import RESTClasses.InteractionAnswer;

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
        return miufs;
    }

    public int pet() {
        if (bored) {
            refusePettingMessage = name + " is bored. You have to entertain him before petting!";

            return 0;
        }

        refusePettingMessage = "";
        return super.pet();
    }

    public InteractionAnswer playWith() {
        if (asleep) {
            String answer = name + " is asleep right now. Cannot play with it";
            return new InteractionAnswer(false, answer);
        }

        String answer = name + " is now happy";

        bored = false;
        playfulness = 0;

        return new InteractionAnswer(true, answer);
    }

    public void checkState() {
        if (!asleep && System.currentTimeMillis() - lastNeedsUpdate >= updateNeedsInterval) {
            playfulness++;
        }

        if (!bored &&  !asleep && playfulness >= playfulnessThreshold) {
            bored = true;
        }

        super.checkState();
    }

    public int getPlayfulness() {
        return playfulness;
    }
}
