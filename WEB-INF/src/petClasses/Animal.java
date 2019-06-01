package petClasses;

public abstract class Animal {
    protected int id;
    protected String name;
    protected int miufs, hunger, sleepiness;

    // flag if pet is asleep
    protected boolean asleep;
    // the time when the pet fell asleep
    protected long fallenAsleepTime;
    // the last time when needs were updated
    protected long lastNeedsUpdate;

    // at what threshold the pet falls asleep
    protected int sleepinessThreshold = 0;
    // how long a pet will sleep
    protected long sleepTotalTime = 0;
    // the interval in milliseconds at which the sleepiness and hunger are updated
    protected long updateNeedsInterval = 0;

    // this message will be set if an animal refuses to be pet
    protected String refusePettingMessage = "";

    {
        lastNeedsUpdate = System.currentTimeMillis();
    }

    /*
        An animal may have a bigger reward in miufs than others
    */
    Animal(String name, int miufs) {
        this.name = name;
        this.miufs = miufs;
    }

    Animal(String name, int miufs, int hunger, int sleepiness) {
        this.name = name;
        this.miufs = miufs;
        this.hunger = hunger;
        this.sleepiness = sleepiness;
    }

    public void feed(int food) {
        hunger = Math.max(hunger - food, 0);

        System.out.println(name + " was fed. Hunger levels = " + hunger);
    }

    public void wakeUp() {
        sleepiness = 0;
        asleep = false;

        System.out.println(name + " woke up");
    }

    /*
        all animals fall asleep if sleepinessThreshold is exceeded

        checkState should be called regularly
    */
    public void checkState() {
        if (!asleep && sleepiness >= sleepinessThreshold) {
            fallenAsleepTime = System.currentTimeMillis();
            asleep = true;

            System.out.println(name + " fell asleep");
        }

        else if (asleep && System.currentTimeMillis() -  fallenAsleepTime >= sleepTotalTime) {
            wakeUp();
        }

        if (!asleep && System.currentTimeMillis() - lastNeedsUpdate >= updateNeedsInterval) {
            lastNeedsUpdate = System.currentTimeMillis();

            System.out.println("UPDATE NEEDS FOR " + name);
            System.out.println("sleepiness = " + sleepiness);
            System.out.println("hunger = " + hunger);

            sleepiness++;
            hunger++;
        }
    }

    // The pet might return miufs or not
    public abstract int receiveMiufs();

    // All animals can be asleep or hungry
    public int pet() {
        if (asleep) {
            refusePettingMessage = name + " is asleep! You cannot pet it right now.";
            System.out.println(refusePettingMessage);

            return 0;
        }

        if (hunger > 0) {
            refusePettingMessage = name + " is hungry! Feed it first!";
            System.out.println(refusePettingMessage);

            return 0;
        }

        refusePettingMessage = "";
        return receiveMiufs();
    }

    public boolean isAsleep() {
        return asleep;
    }

    public boolean isHungry() {
        if (hunger > 0) {
            return true;
        }

        return false;
    }

    public String getName() {
        return name;
    }

    public int getHunger() {
        return hunger;
    }

    public int getSleepiness() {
        return sleepiness;
    }

    public int getMiufs() {
        return miufs;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public void setName(String name) {
        System.out.println("RENAMING " + id + " TO " + name);
        this.name = name;
    }

    public String getRefusePettingMessage() {
        return refusePettingMessage;
    }
}
