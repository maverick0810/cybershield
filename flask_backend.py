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
    """Get response from Gemini LLM"""
    if model is None:
        return "Error: Model not initialized"
    
    try:
        # Add preprompt to the user's input
        preprompt = """
        You are a cybersecurity-aware AI assistant. Your task is to first scan the user input for any Personally Identifiable Information (PII) such as names, phone numbers, email addresses, and addresses.

        Then:
        1. Redact that information by replacing it with context-aware placeholders such as [person name], [phone number], [email address], [address],[enrollment number] by which a person's personal information can be identified etc.
        2. Once redacted, treat the redacted version as the true input, and generate a response based only on the redacted text.
        3. Ensure your final response reflects the placeholders instead of exposing any PII.
        4. use context awareness also where should i redact and where should i not, emphasize a lot on the context awareness part.
        If you are uncertain whether something is PII or not, err on the side of caution and redact it.
        Be helpful. Acknowledge uncertainty if necessary, and do not hallucinate information.
        """
        
        full_prompt = f"{preprompt}\n\nUser input: {prompt}"
        
        response = model.generate_content(full_prompt)
        if response.text:
            return response.text
        else:
            return "No response generated"
    except Exception as e:
        logger.error(f"Error getting response from Gemini: {str(e)}")
        return f"Error: {str(e)}"

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
            if result and result[0]:
                for line in result[0]:
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
        
        response = get_gemini_response(message)
        return jsonify({"response": response})
            
    except Exception as e:
        logger.error(f"Error in /api/chat: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file uploads (images, audio)"""
    try:
        # Log all request data for debugging
        logger.info("Received upload request")
        logger.info(f"Request files: {request.files}")
        logger.info(f"Request form: {request.form}")
        
        if 'file' not in request.files:
            logger.error("No file part in request")
            return jsonify({"response": "No file part in request"})
            
        file = request.files['file']
        
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({"response": "No selected file"})
        
        # Get file extension and determine type
        filename = file.filename.lower()
        logger.info(f"Processing file: {filename}")
        
        # Validate file extension
        if filename.endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            file_type = 'image'
        elif filename.endswith(('.wav', '.mp3', '.m4a', '.ogg')):
            file_type = 'audio'
        else:
            logger.error(f"Unsupported file type: {filename}")
            return jsonify({"response": f"Unsupported file type: {filename}"})
        
        logger.info(f"Processing {file_type} file: {filename}")
        
        # Process file based on type
        if file_type == 'audio':
            extracted_text = process_audio(file)
        else:  # image
            extracted_text = process_image(file)
        
        # Check if processing was successful
        if extracted_text.startswith("Error"):
            return jsonify({"response": extracted_text})
        
        # If there's a message, combine it with the extracted text
        message = request.form.get('message', '')
        if message:
            prompt = f"{message}\n\nExtracted content:\n{extracted_text}"
        else:
            prompt = extracted_text
        
        # Get response from Gemini
        response = get_gemini_response(prompt)
        
        return jsonify({
            "response": response,
            "extracted_text": extracted_text,
            "file_type": file_type
        })
            
    except Exception as e:
        logger.error(f"Error in /api/upload: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask backend on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)