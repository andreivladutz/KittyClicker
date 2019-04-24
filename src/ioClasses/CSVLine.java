package ioClasses;

public class CSVLine {
    /*
        CSVLine holds a split line from a CSV file with its fields
        as Strings. The returned value from getNext should be parsed!
    */
    private String[] fields;
    int currPos = 0;

    public CSVLine(String line) {
        fields = line.split(",");
    }

    // makes sure we don't run out of bounds
    private boolean assertNext() {
        if (fields == null) {
            return false;
        }

        return currPos < fields.length;
    }

    // returns the next field and it goes to the next one
    public String getNext() throws IndexOutOfBoundsException {
        if (!assertNext()) {
            throw new IndexOutOfBoundsException("End of line encountered!");
        }

        return fields[currPos++];
    }

    // returns the next field without going to the next one
    public String peekNext() throws IndexOutOfBoundsException {
        if (!assertNext()) {
            throw new IndexOutOfBoundsException("End of line encountered!");
        }

        return fields[currPos];
    }
}
