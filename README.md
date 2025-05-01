# CyberShield AI - PII Protection Application

CyberShield AI is a sophisticated React-based frontend for demonstrating PII (Personal Identifiable Information) detection and protection capabilities. The application features a user authentication system and a chat interface that can process text inputs, images, audio files, and webpage links.

## Key Features

- **User Authentication**: Registration and login system for secure access
- **PII Detection**: Automatically detects personal information in messages
- **Media Support**: Upload and process images, audio files, and webpage links
- **Secure Storage**: Simulates secure storage of detected PII instead of forwarding to AI models
- **Modern UI**: Dark-themed cybersecurity interface with animations

## Architecture

The application consists of two main components:

1. **Frontend**: React.js application with rich UI components and client-side PII detection
2. **Backend**: 
   - Node.js Express server for authentication
   - Python Flask server for processing messages and media (always responds with "HELLO WE ARE TEAM X")

## Getting Started

### Prerequisites

- Node.js 
- Python 3.x with Flask and Flask-CORS installed

### Running the Application

You can start both servers (Node.js and Flask) simultaneously using the provided script:

```bash
./start_servers.sh
```

Alternatively, you can run them separately:

1. Start the Node.js server:
   ```bash
   npm run dev
   ```

2. Start the Flask backend (in a separate terminal):
   ```bash
   python flask_backend.py
   ```

### Using the Application

1. Open the application in your browser (typically at http://localhost:5000)
2. Register a new account or login with an existing one
3. Navigate to the chat interface
4. Try sending messages with potential PII information (e.g., credit card numbers, emails, etc.)
5. Try uploading images, audio files, or sharing links

## Implementation Details

### PII Detection

The application detects various types of PII including:
- Credit card numbers
- Email addresses
- Phone numbers
- Social Security Numbers
- Dates of birth
- Physical addresses
- Account numbers
- Full names

### Response Handling

The chatbot will always respond with "HELLO WE ARE TEAM X" regardless of the input, as specified in the requirements. The application is designed to be integrated with a more sophisticated AI backend if desired.

## Flask Backend API

The Flask backend provides two main endpoints:

- `/api/chat`: Processes text messages
- `/api/upload`: Handles file uploads (images, audio)

Both endpoints always respond with the message "HELLO WE ARE TEAM X".