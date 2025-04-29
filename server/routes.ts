import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import fs from "fs";
import path from "path";
import multer from "multer";
import { generatePIIReport } from "../client/src/lib/pii-detector";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), 'uploads');
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  }
});

// Generate a response with LLM-like behavior (simplified simulation)
function generateLLMResponse(sanitizedText: string): string {
  // This is a simple mock to demonstrate response structure
  // In production, this would connect to a real LLM API
  
  const questions = [
    "What is your name?",
    "How can I contact you?",
    "Tell me about yourself",
    "Share some personal information",
    "What's your address?"
  ];
  
  // Check if the input is a question about personal info
  const isPersonalInfoRequest = questions.some(q => 
    sanitizedText.toLowerCase().includes(q.toLowerCase())
  );
  
  if (isPersonalInfoRequest) {
    return "I noticed you're asking for personal information. I prefer not to share such details for privacy reasons. Is there anything else I can help you with?";
  }
  
  // Simple responses based on potential content
  if (sanitizedText.includes("[REDACTED]")) {
    return "I see there's some sensitive information that has been redacted for your protection. I've processed your safe, redacted message. How can I assist you further?";
  }
  
  // Default response
  return "I've processed your message safely. Thank you for using our secure AI system. Is there anything else you'd like to discuss?";
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API route to process message with PII detection
  const messageSchema = z.object({
    text: z.string(),
    detectionLevel: z.enum(["High (Sensitive)", "Medium (Standard)", "Low (Minimal)"]).optional(),
    contentType: z.enum(["text", "image", "audio", "webpage"]).default("text"),
  });

  app.post("/api/process-message", (req, res) => {
    try {
      const validatedData = messageSchema.parse(req.body);
      const { text, detectionLevel = "Medium (Standard)", contentType = "text" } = validatedData;
      
      // Use the same PII detection library as frontend for consistency
      const piiResults = generatePIIReport(text, detectionLevel);
      
      // Store PII in secure storage
      if (piiResults.detected) {
        const piiData = {
          sessionId: `session-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: req.user?.id || "anonymous",
          contentType,
          piiItems: piiResults.piiItems
        };
        
        // Use the storage interface to persist PII data
        const userId = req.user?.id || 0;
        storage.storePII(userId, piiData.sessionId, piiData);
        
        console.log(`Detected and stored ${piiResults.piiItems.length} PII items`);
      }
      
      // Generate an LLM response using sanitized text
      const llmResponse = generateLLMResponse(piiResults.sanitizedText);
      
      // Return sanitized text and detection info
      res.json({
        sanitizedText: piiResults.sanitizedText,
        piiDetected: piiResults.detected,
        piiCount: piiResults.piiItems?.length || 0,
        piiItems: piiResults.piiItems,
        llmResponse
      });
    } catch (error) {
      res.status(400).json({ 
        error: "Invalid request data",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // File upload endpoint for image/audio content
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const file = req.file;
      const fileType = file.mimetype.split('/')[0]; // 'image', 'audio', etc.
      
      // Simulating file content extraction based on type
      // In a real implementation, this would use OCR for images, 
      // transcription for audio, etc.
      let extractedText = "";
      
      if (fileType === 'image') {
        // Simulate OCR results - in production would use PaddleOCR as in img_paddle_ocr.py
        extractedText = `Extracted text from image ${file.originalname}. Sample content: Sample resume for John Doe, email: john.doe@example.com, Phone: (555) 123-4567`;
      } else if (fileType === 'audio') {
        // Simulate audio transcription - in production would use Whisper as in audio_red2.py
        extractedText = `Transcribed audio from ${file.originalname}. Sample content: My name is Jane Smith and my credit card number is 4111-1111-1111-1111`;
      } else {
        extractedText = `Content extracted from ${file.originalname}`;
      }
      
      // Process the extracted text through PII detection
      const piiResults = generatePIIReport(extractedText, "High (Sensitive)");
      
      // Store PII if detected
      if (piiResults.detected) {
        const piiData = {
          sessionId: `session-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: req.user?.id || "anonymous",
          contentType: fileType,
          fileName: file.originalname,
          filePath: file.path,
          piiItems: piiResults.piiItems
        };
        
        // Store in secure storage
        const userId = req.user?.id || 0;
        storage.storePII(userId, piiData.sessionId, piiData);
      }
      
      // Generate appropriate LLM response
      const llmResponse = generateLLMResponse(piiResults.sanitizedText);
      
      res.json({
        fileName: file.originalname,
        contentType: fileType,
        sanitizedText: piiResults.sanitizedText,
        originalText: extractedText, // In production, this would be omitted for security
        piiDetected: piiResults.detected,
        piiCount: piiResults.piiItems?.length || 0,
        piiItems: piiResults.piiItems,
        llmResponse
      });
      
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({
        error: "File processing failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Endpoint for webpage content processing
  app.post("/api/process-webpage", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      
      // Simulate webpage content extraction
      // In production, this would use WebBaseLoader as in webpage_redactor.py
      const extractedText = `Extracted content from ${url}. Sample content: Welcome to Example Corp! Contact us at info@example.com or call (800) 555-1234.`;
      
      // Process through PII detection
      const piiResults = generatePIIReport(extractedText, "Medium (Standard)");
      
      // Store PII if detected
      if (piiResults.detected) {
        const piiData = {
          sessionId: `session-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: req.user?.id || "anonymous",
          contentType: "webpage",
          url,
          piiItems: piiResults.piiItems
        };
        
        // Store in secure storage
        const userId = req.user?.id || 0;
        storage.storePII(userId, piiData.sessionId, piiData);
      }
      
      // Generate LLM response
      const llmResponse = generateLLMResponse(piiResults.sanitizedText);
      
      res.json({
        url,
        sanitizedText: piiResults.sanitizedText,
        piiDetected: piiResults.detected,
        piiCount: piiResults.piiItems?.length || 0,
        piiItems: piiResults.piiItems,
        llmResponse
      });
      
    } catch (error) {
      console.error("Webpage processing error:", error);
      res.status(500).json({
        error: "Webpage processing failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
