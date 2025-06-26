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
# load_dotenv()

# Get Google API key from environment variable
GOOGLE_API_KEY = "AIzaSyAkq6CYdk-8gOekkZaimnmlhDa_hjVinBk"


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
    model = genai.GenerativeModel(model_name="gemini-2.0-flash")
    # model = genai.GenerativeModel(model_name="gemini-1.5-pro")
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
        
        full_prompt = f"User input: {prompt}"
        
        # Generate response with safety settings
        response = model.generate_content(
            full_prompt,
            safety_settings=[
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_NONE"
                }
            ]
        )
        
        # Log the response for debugging
        logger.info(f"Gemini response type: {type(response)}")
        logger.info(f"Gemini response: {response}")
        
        # Handle the response properly based on its structure
        if hasattr(response, 'candidates') and response.candidates:
            # New format with candidates
            return response.candidates[0].content.parts[0].text
        elif hasattr(response, 'parts') and response.parts:
            # Format with parts
            return response.parts[0].text
        elif hasattr(response, 'text'):
            # Simple text format
            return response.text
        else:
            # Try to get text from any available attribute
            for attr in dir(response):
                if not attr.startswith('_'):
                    value = getattr(response, attr)
                    if isinstance(value, str):
                        return value
                    elif hasattr(value, 'text'):
                        return value.text
            
            logger.error("Could not extract text from response")
            return "I apologize, but I couldn't generate a proper response. Please try again."
            
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
        
        # Read file content first to verify it's not empty
        file_content = file.read()
        if not file_content:
            logger.error("Empty file content")
            return jsonify({"response": "Error: Empty file content"})
        
        # Reset file pointer
        file.seek(0)
        
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