from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import whisper
from paddleocr import PaddleOCR
import tempfile
import logging
from dotenv import load_dotenv
from PIL import Image
import io
import shutil
from datetime import datetime
import json


# Load environment variables
load_dotenv()

# Get Google API key from environment variable
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
OUTPUT_FOLDER = 'output'
if not os.path.exists(OUTPUT_FOLDER):
    os.makedirs(OUTPUT_FOLDER)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Gemini
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize all models
try:
    # Initialize Gemini
    model = genai.GenerativeModel(model_name="gemini-1.5-pro")
    print("✅ Gemini model initialized")

    # Initialize Whisper for audio
    whisper_model = whisper.load_model("base")
    print("✅ Whisper model initialized")

    # Initialize PaddleOCR for images
    ocr = PaddleOCR(use_angle_cls=True, lang='en')
    print("✅ PaddleOCR model initialized")

    logger.info("All models initialized successfully")

except Exception as e:
    logger.error(f"Error initializing models: {str(e)}")
    model = None
    whisper_model = None
    ocr = None

def get_gemini_response(prompt):
    """Get response from Gemini LLM and extract entities, redacted content, and confidence."""
    if model is None:
        return "Error: Model not initialized"
    
    try:
        # Add preprompt to the user's input
        preprompt = """
        You are a cybersecurity-aware AI, answer accordingly. Your task is to first scan the user input for any Personally Identifiable Information (PII) such as names, phone numbers, email addresses, ids, and addresses etc.
        
        Then:
        1. Redact that information by replacing it with context-aware placeholders such as [person name], [phone number], [email address], [address],[enrollment number] by which a person's personal information can be identified etc.
        2. Once redacted, treat the redacted version as the true input, and generate a response based only on the redacted text.
        3. Ensure your final response reflects the placeholders instead of exposing any PII.
        4. Use context awareness also based on the user input's context where should I redact and where should I not, emphasize a lot on the context awareness part.
        If you are uncertain whether something is PII or not, err on the side of caution and redact it.
        Be helpful. Acknowledge uncertainty if necessary, and do not hallucinate information.
        """
        
        full_prompt = f"{preprompt}\n\nUser input: {prompt}"
        
        # Generate response with safety settings
        response = model.generate_content(
            full_prompt,
            safety_settings=[
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
            ]
        )
        
        # Log the response for debugging
        logger.info(f"Gemini response: {response}")
        
        # Extract entities and redacted content from the response
        entities = []
        redacted_output = ""
        confidence_threshold = 0.90  # Example threshold, can be adjusted based on your use case
        
        if hasattr(response, 'entities'):
            # Assume response.entities is a list of identified entities with type and value
            for entity in response.entities:
                entities.append({
                    "type": entity['type'],
                    "value": entity['value'],
                    "confidence": entity.get('confidence', 1.0)  # Default confidence to 1.0 if not provided
                })
        
        if hasattr(response, 'redacted_output'):
            redacted_output = response.redacted_output
        
        # Ensure response structure includes these details
        return {
            "response": response,
            "entities": entities,
            "redacted_output": redacted_output,
            "confidence_threshold": confidence_threshold
        }
    except Exception as e:
        logger.error(f"Error getting response from Gemini: {str(e)}")
        return {"error": str(e)}

def process_audio(audio_file):
    """Process audio file using Whisper"""
    try:
        if whisper_model is None:
            return "Audio processing model not available."
        
        # Save uploaded file temporarily
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"audio_{os.urandom(8).hex()}.wav")
        
        try:
            # Save the file
            audio_file.save(temp_path)
            logger.info(f"Saved audio file to: {temp_path}")
            
            # Verify file exists
            if not os.path.exists(temp_path):
                raise FileNotFoundError(f"Failed to save audio file to {temp_path}")
            
            # Transcribe audio
            result = whisper_model.transcribe(temp_path)
            logger.info("Audio transcription completed")
            
            return result["text"]
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                logger.info(f"Cleaned up temporary file: {temp_path}")
                
    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}")
        return f"Error processing audio: {str(e)}"

def process_image(image_file):
    """Process image using PaddleOCR"""
    try:
        if ocr is None:
            return "Image processing model not available."
        
        # Log file details
        logger.info(f"Processing image file: {image_file.filename}")
        logger.info(f"Content type: {image_file.content_type}")
        
        # Create a unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"image_{timestamp}_{os.urandom(4).hex()}.png"
        saved_path = os.path.join(UPLOAD_FOLDER, filename)
        
        try:
            # Read the file content first
            file_content = image_file.read()
            if not file_content:
                logger.error("Empty file content")
                return "Error: Empty file content"
            
            # Reset file pointer
            image_file.seek(0)
            
            # Save the file locally
            image_file.save(saved_path)
            logger.info(f"Saved image file to: {saved_path}")
            
            # Verify the file was saved correctly
            if not os.path.exists(saved_path):
                logger.error("File was not saved")
                return "Failed to save image file"
            
            if os.path.getsize(saved_path) == 0:
                logger.error("Saved file is empty")
                return "Failed to save image file (empty file)"
            
            # Try to open with PIL to validate it's a proper image
            try:
                image = Image.open(saved_path)
                # Force load to validate image
                image.load()
                logger.info(f"Image size: {image.size}, Mode: {image.mode}")
            except Exception as e:
                logger.error(f"Invalid image file: {str(e)}")
                return "Invalid image file"
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
                logger.info("Converted image to RGB mode")
            
            # Save the processed image
            image.save(saved_path, 'PNG')
            logger.info(f"Processed and saved image file to: {saved_path}")
            
            # Extract text using the simpler approach
            result = ocr.ocr(saved_path, cls=True)
            logger.info("Image OCR completed")
            
            # Extract text from OCR result
            extracted_text = ""
            if result and len(result) > 0 and result[0]:
                for line in result[0]:
                    if line and len(line) > 1 and line[1] and len(line[1]) > 0:
                        extracted_text += line[1][0] + "\n"
                logger.info(f"Extracted text length: {len(extracted_text)} characters")
            else:
                logger.info("No text found in image")
            
            if not extracted_text.strip():
                return "No text found in the image"
            
            return extracted_text.strip()
            
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            return f"Error processing image: {str(e)}"
            
    except Exception as e:
        logger.error(f"Error in process_image: {str(e)}")
        return f"Error processing image: {str(e)}"

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle text input"""
    try:
        data = request.json
        message = data.get('message', '')
        
        if not message:
            return jsonify({"response": "No message provided"})
        
        # Get response from Gemini, including entities, redacted content, and confidence threshold
        response_data = get_gemini_response(message)
        
        if "error" in response_data:
            return jsonify({"error": response_data["error"]}), 500
        
        response = response_data["response"]
        entities = response_data["entities"]
        redacted_output = response_data["redacted_output"]
        confidence_threshold = response_data["confidence_threshold"]
        
        # Save to JSON file with entities and redacted output
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        json_filename = f"chat_{timestamp}.json"
        output_path = os.path.join(OUTPUT_FOLDER, json_filename)
        
        with open(output_path, 'w') as f:
            json.dump({
                "input": message,
                "entities": entities,
                "redacted_output": redacted_output,
                "confidence_threshold": confidence_threshold,
                "response": response
            }, f, indent=4)
        
        return jsonify({
            "response": response,
            "entities": entities,
            "redacted_output": redacted_output,
            "confidence_threshold": confidence_threshold
        })
    except Exception as e:
        logger.error(f"Error in /api/chat: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and process for redaction, entity extraction"""
    try:
        # Check if a file was uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        # Read and extract text from the file (assume it's an image, text, or audio)
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        
        # Extract text from the uploaded file
        extracted_text = ""
        if file_extension in ['png', 'jpg', 'jpeg']:  # Image file
            extracted_text = extract_text_from_image(file)
        elif file_extension in ['mp3', 'wav']:  # Audio file
            extracted_text = extract_text_from_audio(file)
        elif file_extension in ['txt']:  # Text file
            extracted_text = file.read().decode('utf-8')
        
        # If no text was extracted, return an error
        if not extracted_text:
            return jsonify({"error": "No text extracted from file"}), 400
        
        # Get Gemini response, including entities and redacted content
        response_data = get_gemini_response(extracted_text)
        
        if "error" in response_data:
            return jsonify({"error": response_data["error"]}), 500
        
        response = response_data["response"]
        entities = response_data["entities"]
        redacted_output = response_data["redacted_output"]
        confidence_threshold = response_data["confidence_threshold"]
        
        # Save to JSON file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        json_filename = f"upload_{timestamp}.json"
        output_path = os.path.join(OUTPUT_FOLDER, json_filename)
        
        with open(output_path, 'w') as f:
            json.dump({
                "file_name": file.filename,
                "extracted_text": extracted_text,
                "entities": entities,
                "redacted_output": redacted_output,
                "confidence_threshold": confidence_threshold,
                "response": response
            }, f, indent=4)
        
        return jsonify({
            "file_name": file.filename,
            "entities": entities,
            "redacted_output": redacted_output,
            "confidence_threshold": confidence_threshold,
            "response": response
        })
    
    except Exception as e:
        logger.error(f"Error in /api/upload: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("Starting Flask backend on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)