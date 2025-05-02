# CyberShieldAI

A cybersecurity-aware AI assistant that can process text, images, and audio files to identify and redact Personally Identifiable Information (PII).

## Features

- Text analysis with PII detection and redaction
- Image processing with OCR (Optical Character Recognition)
- Audio transcription
- Secure handling of sensitive information
- Context-aware PII redaction

## Prerequisites

- Python 3.8 or higher
- Google API key for Gemini
- FFmpeg (for audio processing)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/CyberShieldAI.git
cd CyberShieldAI
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root and add your Google API key:

```
GOOGLE_API_KEY=your_api_key_here
```

## Usage

1. Start the Flask backend:

```bash
python flask_backend.py
```

2. The server will start on `http://localhost:5001`

3. API Endpoints:
   - `/api/chat` - For text analysis
   - `/api/upload` - For image and audio file processing

## API Documentation

### Text Analysis

```http
POST /api/chat
Content-Type: application/json

{
    "message": "Your text here"
}
```

### File Upload

```http
POST /api/upload
Content-Type: multipart/form-data

file: [your file]
message: [optional message]
```

## Project Structure

```
CyberShieldAI/
├── flask_backend.py      # Main Flask application
├── requirements.txt      # Python dependencies
├── .env                 # Environment variables
├── uploads/            # Directory for uploaded files
└── README.md           # Project documentation
```

## Security Features

- PII detection and redaction
- Secure file handling
- Temporary file cleanup
- Environment variable protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI
- PaddleOCR
- OpenAI Whisper
