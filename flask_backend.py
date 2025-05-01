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
    # Extract data from request
    data = request.json
    
    # Log received data (for debugging)
    print(f"Received message: {data}")
    
    # Always return the same response
    return jsonify({
        "response": "HELLO WE ARE TEAM X",
        "status": "success"
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """
    Endpoint to handle file uploads (images, audio).
    Files are received but not processed, always returns 'HELLO WE ARE TEAM X'.
    """
    # Check if there's a file in the request
    if 'file' not in request.files:
        return jsonify({
            "response": "HELLO WE ARE TEAM X",
            "status": "success",
            "note": "No file was uploaded, but we're responding anyway."
        })
    
    file = request.files['file']
    
    # Log file information (for debugging)
    print(f"Received file: {file.filename}, type: {file.content_type}")
    
    # Always return the same response
    return jsonify({
        "response": "HELLO WE ARE TEAM X", 
        "status": "success",
        "fileReceived": True
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)