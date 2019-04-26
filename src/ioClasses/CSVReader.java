package ioClasses;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileNotFoundException;
import java.io.IOException;

import static java.lang.Integer.parseInt;
import static java.lang.Long.parseLong;

/*
    The class that receives a filename for a csv file and reads the contents

    readLine() should be called first, to buffer the read CSV line and then
    nextInt(), nextLong() or nextString() returns the next parsed field in the read line
    or throws an exception if the requested field is not the type that's being asked for

    hasNext*Type* can be used to check if the next field is of the specified type
*/
public class CSVReader {
    // the actual reader under the hood
    BufferedReader in;
    // if the FileMotFoundException is encountered
    boolean fileNotFound = false;

    // keeping the filepath of the opened file
    String openedFilename;

    // every line read is parsed with the CSVLine class
    CSVLine lastLine;

    private void openFile(String filename) {
        try {
            in = new BufferedReader(new FileReader(filename));
        }
        catch(FileNotFoundException fErr) {
            fileNotFound = true;
        }
    }

    // method for reopening the file after the verification of the file format
    private void reopenFile() {
        close();
        openFile(openedFilename);
    }

    public CSVReader(String filename) {
        openFile(filename);
        openedFilename = filename;
    }

    // added this method to verify the existence of a file
    // ended up using another method
    public boolean isFileAvailable() {
        return !fileNotFound;
    }


    private boolean verifyLine(String[] types) {
        for (String type: types) {
            if (type.toLowerCase() == "int") {
                try {
                    nextInt();
                }
                catch (IOException e) {
                    // doesn't follow the provided format
                    return false;
                }
            }
            else if (type.toLowerCase() == "long") {
                try {
                    nextLong();
                }
                catch (IOException e) {
                    // doesn't follow the provided format
                    return false;
                }
            }
            else if (type.toLowerCase() == "string") {
                try {
                    nextString();
                }
                catch (IOException e) {
                    // doesn't follow the provided format
                    return false;
                }
            }
        }

        // followed the format
        return true;
    }

    // method for verifying the correct format of a file before reading from it.
    // It receives a string array of types to be checked upon every line
    // in the file in the exact same order as received
    public boolean verifyFormat(String[] types) {
        while (readLine()) {
            if (!verifyLine(types)) {
                reopenFile();
                return false;
            }
        }

        reopenFile();
        // every line in the csv file has a correct format
        return true;
    }

    // same as the method above, just accepting more formats
    public boolean verifyFormat(String[][] typesArr) {
        while (readLine()) {
            boolean respectsOneFormat = false;

            // now trying all the possible formats
            for (String[] lineTypes: typesArr) {
                // if it respects at least one type of formatting it's ok
                respectsOneFormat = verifyLine(lineTypes) || respectsOneFormat;

                // found one format that is respected. skipping to the verification of the next line
                if (respectsOneFormat) {
                    break;
                }
                lastLine.rewindLine();
            }
            // it doesn't respect any format
            if (!respectsOneFormat) {
                reopenFile();
                return false;
            }
        }

        reopenFile();
        return true;
    }

    /*
        Reads a line into lastLine and returns true if a file has been read
        or returns false if EOF was encountered or an exception occurred
    */
    public boolean readLine() {
        String line;

        try {
            line = in.readLine();
        }
        catch (IOException e) {
            return false;
        }

        if (line == null || line == "") {
            return false;
        }

        lastLine = new CSVLine(line);
        return true;
    }

    // just check if there is a next field
    public boolean hasNext() {
        try {
            lastLine.peekNext();
        } catch (IndexOutOfBoundsException e) {
            return false;
        } catch (NullPointerException e) {
            return false;
        }

        return true;
    }

    public boolean hasNextInt() {
        if (!hasNext()) {
            return false;
        }

        String nextField = lastLine.peekNext();

        try {
            parseInt(nextField);
        }
        catch(NumberFormatException e) {
            // the field is not formatted as an int
            return false;
        }

        return true;
    }

    public boolean hasNextLong() {
        if (!hasNext()) {
            return false;
        }

        String nextField = lastLine.peekNext();

        try {
            parseLong(nextField);
        }
        catch(NumberFormatException e) {
            // the field is not formatted as an int
            return false;
        }

        return true;
    }

    public boolean hasNextString() {
        if (!hasNext()) {
            return false;
        }

        // fields are kept as String by default so if there is one
        // it surely is a String
        return true;
    }

    public int nextInt() throws IOException {
        if (!hasNextInt()) {
            throw new IOException("No int available!");
        }

        return parseInt(lastLine.getNext());
    }

    public long nextLong() throws IOException {
        if (!hasNextLong()) {
            throw new IOException("No long available!");
        }

        return parseLong(lastLine.getNext());
    }

    public String nextString() throws IOException {
        if (!hasNextString()) {
            throw new IOException("No String available!");
        }

        return lastLine.getNext();
    }

    public void close() {
        try {
            in.close();
        }
        catch (IOException e) {
            System.out.println("Could not close input stream");
        }
    }
}
