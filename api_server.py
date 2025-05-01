from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import tempfile
from werkzeug.utils import secure_filename
import traceback

# Import redaction modules
try:
    from attached_assets.redaction_pipeline2 import RedactionPipeline
    from attached_assets.audio_red2 import AudioTranscriber, AudioRedactor
    from attached_assets.img_paddle_ocr import extract_text
    from attached_assets.webpage_redactor import WebpageRedactor
    
    # Initialize components
    redaction_pipeline = RedactionPipeline()
    audio_transcriber = AudioTranscriber()
    audio_redactor = AudioRedactor()
    webpage_redactor = WebpageRedactor()
    
    MODULES_LOADED = True
except ImportError as e:
    print(f"Warning: Some redaction modules couldn't be imported: {e}")
    print("The server will still run but some functionality may be limited.")
    MODULES_LOADED = False

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Map detection levels to internal representation
DETECTION_LEVELS = {
    "High (Sensitive)": "high",
    "Medium (Standard)": "medium",
    "Low (Minimal)": "low"
}

@app.route('/')
def index():
    """Health check endpoint"""
    modules_status = "loaded" if MODULES_LOADED else "not loaded"
    return jsonify({
        "status": "running",
        "redaction_modules": modules_status
    })

@app.route('/api/process-python', methods=['POST'])
def process_request():
    """Main processing endpoint that handles different content types"""
    try:
        if not MODULES_LOADED:
            return jsonify({
                "error": "Redaction modules not loaded. Check your installation."
            }), 500
            
        # Determine the content type (text, image, audio, webpage)
        if request.is_json:
            # Handle JSON input (text or webpage URL)
            data = request.json
            content_type = data.get('contentType', 'text')
            detection_level = DETECTION_LEVELS.get(data.get('detectionLevel', 'Medium (Standard)'), 'medium')
            
            if content_type == 'text':
                # Process text input
                return process_text(data.get('text', ''), detection_level)
            elif content_type == 'webpage':
                # Process webpage URL
                return process_webpage(data.get('url', ''), detection_level)
        else:
            # Handle file uploads (image or audio)
            if 'file' not in request.files:
                return jsonify({"error": "No file provided"}), 400
                
            file = request.files['file']
            content_type = request.form.get('contentType', 'image')
            detection_level = DETECTION_LEVELS.get(request.form.get('detectionLevel', 'Medium (Standard)'), 'medium')
            
            if file.filename == '':
                return jsonify({"error": "No file selected"}), 400
                
            if content_type == 'image':
                return process_image(file, detection_level)
            elif content_type == 'audio':
                return process_audio(file, detection_level)
                
        return jsonify({"error": "Unsupported content type"}), 400
                
    except Exception as e:
        print(f"Error processing request: {e}")
        traceback.print_exc()
        return jsonify({
            "error": f"Server error: {str(e)}"
        }), 500

def process_text(text, detection_level):
    """Process text using the redaction pipeline"""
    try:
        # Run the text through redaction pipeline
        result = redaction_pipeline.run_pipeline(text, {
            "sensitivity_level": detection_level
        })
        
        # Extract processed results
        sanitized_text = result.get('sanitized_text', '')
        pii_items = result.get('redacted_entities', [])
        
        # Generate LLM response based on sanitized text
        llm_response = f"I've received your message and protected {len(pii_items)} pieces of personal information. Here's a non-identifying response based on your input."
        
        return jsonify({
            "piiDetected": len(pii_items) > 0,
            "originalText": text,
            "sanitizedText": sanitized_text,
            "piiItems": pii_items,
            "llmResponse": llm_response
        })
        
    except Exception as e:
        print(f"Error processing text: {e}")
        traceback.print_exc()
        return jsonify({
            "error": f"Text processing error: {str(e)}"
        }), 500

def process_image(file, detection_level):
    """Process image using OCR and redaction pipeline"""
    try:
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Extract text from image using OCR
        extracted_text = extract_text(filepath)
        
        # Process extracted text through redaction pipeline
        result = redaction_pipeline.run_pipeline(extracted_text, {
            "sensitivity_level": detection_level
        })
        
        # Extract processed results
        sanitized_text = result.get('sanitized_text', '')
        pii_items = result.get('redacted_entities', [])
        
        # Generate LLM response
        llm_response = f"I've processed your image and found {len(pii_items)} pieces of personal information. The image contained text which has been secured."
        
        return jsonify({
            "piiDetected": len(pii_items) > 0,
            "originalText": extracted_text,
            "sanitizedText": sanitized_text,
            "piiItems": pii_items,
            "llmResponse": llm_response
        })
        
    except Exception as e:
        print(f"Error processing image: {e}")
        traceback.print_exc()
        return jsonify({
            "error": f"Image processing error: {str(e)}"
        }), 500

def process_audio(file, detection_level):
    """Process audio file using transcription and redaction"""
    try:
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Transcribe audio
        transcription = audio_transcriber.transcribe_audio(filepath)
        
        if isinstance(transcription, list) and transcription:
            # Get the text from the first segment or join all segments
            if isinstance(transcription[0], dict) and 'text' in transcription[0]:
                extracted_text = ' '.join(segment['text'] for segment in transcription)
            else:
                extracted_text = ' '.join(transcription)
        else:
            extracted_text = str(transcription)
        
        # Process transcribed text through redaction pipeline
        result = redaction_pipeline.run_pipeline(extracted_text, {
            "sensitivity_level": detection_level
        })
        
        # Extract processed results
        sanitized_text = result.get('sanitized_text', '')
        pii_items = result.get('redacted_entities', [])
        
        # Generate LLM response
        llm_response = f"I've processed your audio file and found {len(pii_items)} pieces of personal information. The audio contained speech which has been transcribed and secured."
        
        return jsonify({
            "piiDetected": len(pii_items) > 0,
            "originalText": extracted_text,
            "sanitizedText": sanitized_text,
            "piiItems": pii_items,
            "llmResponse": llm_response
        })
        
    except Exception as e:
        print(f"Error processing audio: {e}")
        traceback.print_exc()
        return jsonify({
            "error": f"Audio processing error: {str(e)}"
        }), 500

def process_webpage(url, detection_level):
    """Process webpage content using webpage redactor"""
    try:
        # Fetch and extract text from webpage
        extracted_text = webpage_redactor.fetch_webpage_text(url)
        
        # Process extracted text through redaction pipeline
        result = redaction_pipeline.run_pipeline(extracted_text, {
            "sensitivity_level": detection_level
        })
        
        # Extract processed results
        sanitized_text = result.get('sanitized_text', '')
        pii_items = result.get('redacted_entities', [])
        
        # Generate LLM response
        llm_response = f"I've processed the webpage at {url} and found {len(pii_items)} pieces of personal information. The content has been secured."
        
        return jsonify({
            "piiDetected": len(pii_items) > 0,
            "originalText": extracted_text,
            "sanitizedText": sanitized_text,
            "piiItems": pii_items,
            "llmResponse": llm_response
        })
        
    except Exception as e:
        print(f"Error processing webpage: {e}")
        traceback.print_exc()
        return jsonify({
            "error": f"Webpage processing error: {str(e)}"
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting Python redaction API server on port {port}...")
    print("To make this server available to your web app, use ngrok or localtunnel:")
    print("  ngrok: ngrok http 5001")
    print("  localtunnel: lt --port 5001")
    app.run(host='0.0.0.0', port=port)