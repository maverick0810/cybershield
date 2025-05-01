# CyberShield AI - PII Protection Platform

A dynamic React-based frontend for an LLM model focused on cybersecurity and PII protection with animations and user authentication.

## Features

- PII detection and redaction across multiple content types:
  - Text messages
  - Images (OCR-based redaction)
  - Audio files (transcription and redaction)
  - Webpages (content extraction and redaction)
- Attractive, animated user interface
- Multiple detection sensitivity levels
- Support for local Python-based redaction engine
- JavaScript fallback for PII detection when Python engine is unavailable

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Express.js, Node.js
- **Python Integration**: Flask API server for advanced redaction capabilities
- **Authentication**: Passport.js with local strategy

## Running the Application

### Frontend & Node Backend

```bash
npm run dev
```

This will start both the React frontend and the Express backend.

### Python Redaction Server (Optional)

For enhanced PII redaction capabilities, you can run the Python redaction server locally:

1. Install required Python packages:

```bash
pip install -r python_requirements.txt
```

2. Run the Python API server:

```bash
python api_server.py
```

3. Make the Python server publicly accessible using ngrok or localtunnel:

Using ngrok:
```bash
ngrok http 5001
```

Using localtunnel:
```bash
npx localtunnel --port 5001
```

4. In the web application, go to the Demo page and enter the public URL in the "Python Backend Connection" field.

## Python Redaction Pipeline

The Python redaction pipeline provides more sophisticated PII detection:

- **Standard PII**: Names, emails, phone numbers, addresses, SSNs, credit cards, dates of birth, account numbers
- **Sensitive Information**: Mental health, medical information, personal crisis, abuse information
- **Advanced Data**: Biometric data, genetic information, behavioral data, employee IDs

## Directory Structure

- `/client` - React frontend
- `/server` - Express backend
- `/attached_assets` - Python redaction implementation files
- `/api_server.py` - Flask server for Python redaction capabilities
- `/uploads` - Temporary storage for uploaded files

## Using the Demo

1. Navigate to the Demo page
2. Select content type (text, image, audio, webpage)
3. Set detection level (low, medium, high)
4. Enter text or upload a file
5. View the PII detection results and redacted content

## Authentication

The application includes user authentication:
- Registration
- Login
- Protected routes

## Connecting to the Python Backend

To use the full capabilities of the redaction pipeline:

1. Run the Python redaction server as described above
2. Copy the public URL provided by ngrok/localtunnel
3. In the Demo page, enter this URL in the "Python Backend Connection" section
4. Click "Connect"
5. Now all redaction processing will be handled by the Python backend

If the Python backend is unavailable, the app will automatically fallback to the JavaScript implementation.