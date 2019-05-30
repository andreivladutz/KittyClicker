package ioClasses;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.BufferedWriter;
import java.io.FileWriter;

public class CSVWriter {
    private PrintWriter out;

    // constructor creates a PrintWriter class for convenient writing to *filename* csv file
    public CSVWriter(String filename, boolean append) {
        try {
            out = new PrintWriter(new BufferedWriter(new FileWriter(filename, append)));
        }
        catch(IOException e) {
            System.out.println("Exception occurred while trying to open file");
            System.out.println(e.getMessage());
        }
    }

    /*
        all write methods also have a newline flag if the written value is the last on this line
    */
    public void writeInt(int val, boolean newline) {
        out.print(val);

        if (newline) {
            out.println();
        } else {
            out.print(',');
        }
    }

    public void writeLong(long val, boolean newline) {
        out.print(val);

        if (newline) {
            out.println();
        } else {
            out.print(',');
        }
    }

    public void writeString(String val, boolean newline) {
        out.print(val);

        if (newline) {
            out.println();
        } else {
            out.print(',');
        }
    }

    public void close() {
        out.close();
    }
}
