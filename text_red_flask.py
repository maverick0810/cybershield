from flask import Flask, request, jsonify
from redaction_pipeline2 import RedactionPipeline  # import your class from the file
import traceback
import google.generativeai as genai
import os
import time

app = Flask(__name__)
redactor = RedactionPipeline()  # instantiate your redactor

# Configure Gemini
GOOGLE_API_KEY = "AIzaSyCePl8wfB1sKqH2fOyRk1TytdluP99_uo0"
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize Gemini model with safety settings
generation_config = {
    "temperature": 0.9,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
}

safety_settings = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
]

# Initialize the model
try:
    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro",
        generation_config=generation_config,
        safety_settings=safety_settings
    )
    print("Successfully initialized Gemini model")
except Exception as e:
    print(f"Error initializing model: {str(e)}")
    model = None

@app.route('/redact', methods=['POST'])
def redact_text():
    try:
        data = request.get_json()
        text = data.get("text")
        feedback = data.get("feedback", {})

        if not text:
            return jsonify({"error": "Missing 'text' in request"}), 400

        result = redactor.run_pipeline(text, feedback=feedback)
        return jsonify(result)

    except Exception as e:
        return jsonify({
            "error": str(e),
            "trace": traceback.format_exc()
        }), 500

if __name__ == '__main__':
    print("Starting Flask backend on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
