package petContainers;

public final class Wallet {
    private static Wallet instance = null;

    public static Wallet getWalletInstance(int initialMiufs) {
        if (instance == null) {
            // the game starts with 10 miufs available
            instance = new Wallet(initialMiufs);
        }

        return instance;
    }

    public static Wallet getWalletInstance() throws NullPointerException {
        if (instance == null) {
            throw new NullPointerException("The wallet must be initialised first by calling getWalletInstance(int)");
        }

        return instance;
    }

    private int currentMiufs;

    private Wallet(int miufs) {
        currentMiufs = miufs;
    }

    public void receiveMiufs(int miufs) {
        currentMiufs += miufs;
    }

    public void payMiufs(int miufs) throws Exception {
        if (!checkFunds(miufs)) {
            throw new Exception("NOT ENOUGH FUNDS");
        }

        currentMiufs -= miufs;
    }

    public boolean checkFunds(int miufs) {
        return miufs <= currentMiufs;
    }

    public int getCurrentMiufs() {
        return currentMiufs;
    }
}
