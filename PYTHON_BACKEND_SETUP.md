# Setting Up the Python Redaction Backend

This document provides step-by-step instructions for setting up and running the Python backend redaction server for the CyberShield AI application.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- ngrok or localtunnel (for making your local server accessible)

## Installation

1. Clone or download this repository to your local machine

2. Install the required Python packages:

```bash
pip install -r python_requirements.txt
```

This will install:
- Flask (web framework)
- Flask-CORS (for handling cross-origin requests)
- Requests (for HTTP requests)
- BeautifulSoup4 (for webpage scraping)
- PaddleOCR (for image text extraction)
- Pillow (for image processing)
- Python-dotenv (for environment variables)
- Werkzeug (for file handling)

## Running the Redaction Server

1. Start the Python API server:

```bash
python api_server.py
```

The server will start on port 5001 by default.

## Making the Server Publicly Accessible

Since the web application runs on a different domain, you need to make your local server accessible via a public URL.

### Option 1: Using ngrok

1. [Download and install ngrok](https://ngrok.com/download)

2. Run ngrok to create a tunnel to your local server:

```bash
ngrok http 5001
```

3. Copy the https URL provided by ngrok (e.g., `https://a1b2c3d4.ngrok.io`)

### Option 2: Using localtunnel

1. Install localtunnel via npm:

```bash
npm install -g localtunnel
```

2. Run localtunnel to create a tunnel to your local server:

```bash
lt --port 5001
```

3. Copy the URL provided by localtunnel

## Connecting the Web Application to Your Python Backend

1. Open the CyberShield AI web application in your browser

2. Navigate to the Demo page

3. In the "Python Backend Connection" section (bottom of the right panel), enter the public URL you copied from ngrok or localtunnel

4. Click "Connect"

5. Now you can use the chat interface with the enhanced redaction capabilities provided by your local Python backend

## Troubleshooting

If you encounter issues:

1. Check that the Python server is running (terminal should show "Starting Python redaction API server on port 5001...")

2. Verify that ngrok/localtunnel is properly tunneling to your local server

3. Ensure the URL entered in the web application is correct and includes the protocol (https://)

4. Check the browser console for any CORS-related errors

5. If modules fail to load, verify that all files in the `attached_assets` directory are present and accessible

## How It Works

The Python backend provides:

1. **Text Redaction**: Using pattern matching and context-aware detection for PII elements
2. **Image Processing**: OCR to extract text from images and then apply redaction
3. **Audio Processing**: Transcription of audio files to text and redaction of the content
4. **Webpage Redaction**: Extraction of text content from webpages and redaction of sensitive information

When the web application communicates with this backend, it sends content for processing and receives:
- The sanitized (redacted) version of the content
- Information about detected PII items
- A simulated response from an AI assistant (that would have only seen the redacted content)

This ensures that no sensitive information is ever passed to external AI systems.