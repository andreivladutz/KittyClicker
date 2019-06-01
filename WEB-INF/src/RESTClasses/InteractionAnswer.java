package RESTClasses;


import javax.xml.bind.annotation.XmlRootElement;

// a small class just for grouping a boolean and a String
// so we know when an interaction went ok, or get a string explaining why we
// couldn't interact with the pet otherwise
@XmlRootElement(name = "answer")
public class InteractionAnswer {
    private boolean ok;
    private String answer;

    public InteractionAnswer(boolean ok, String answer) {
        this.ok = ok;
        this.answer = answer;
    }

    public boolean isOk() {
        return ok;
    }

    public String getAnswer() {
        return answer;
    }
}
