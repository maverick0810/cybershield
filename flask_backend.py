from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Endpoint to process chat messages and return a response.
    Always returns 'HELLO WE ARE TEAM X' regardless of input.
    """
    try:
        # Get the message from the request
        data = request.json
        message = data.get('message', '')
        
        # Log the received message (for debugging)
        print(f"Received message: {message}")
        
        # Always return the same response
        return jsonify({"response": "HELLO WE ARE TEAM X"})
    except Exception as e:
        print(f"Error in /api/chat: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """
    Endpoint to handle file uploads (images, audio).
    Files are received but not processed, always returns 'HELLO WE ARE TEAM X'.
    """
    try:
        # Get the file and message
        file = request.files.get('file')
        message = request.form.get('message', '')
        
        # Log the upload (for debugging)
        if file:
            print(f"Received file: {file.filename}, Message: {message}")
        
        # Always return the same response
        return jsonify({"response": "HELLO WE ARE TEAM X"})
    except Exception as e:
        print(f"Error in /api/upload: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask backend on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)