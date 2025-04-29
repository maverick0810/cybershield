from redaction_pipeline2 import RedactionPipeline
import json

if __name__ == "__main__":
    raw_input = "Can you write an email to notify HR that John D’Souza (Emp ID: 00723) is resigning effective June 1st. His contact is john.dsouza@thalesgroup.com and phone is +91 98765 43210."
    raw_input2="Tell me who is peter parker"
    feedback = {
        "correct": False,
        "comment": "Missed redacting 'Emp ID: 00723'",
        "suggested_label": "ID"
    }

    pipeline = RedactionPipeline()
    output = pipeline.run_pipeline(raw_input, feedback=feedback)

    # print(json.dumps(output, indent=2))
    print(output["llm_output"])