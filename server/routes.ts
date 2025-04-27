import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";

// PII detection simulation (would connect to Python backend in production)
function detectPII(text: string) {
  // Patterns for basic PII detection
  const patterns = {
    creditCard: /\b(?:\d{4}[- ]?){3}\d{4}\b/,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
    phone: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/,
    ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/,
    dob: /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/i,
    address: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct|Plaza|Square|Sq|Trail|Trl|Parkway|Pkwy|Circle|Cir)\b,?(?:\s+[A-Za-z]+,)?\s+[A-Za-z]{2}\s+\d{5}(?:-\d{4})?\b/i,
    accountNumber: /\b[A-Z]\d{8}\b/,
    name: /\b(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)?\s*[A-Z][a-z]+\s+[A-Z][a-z]+\b/,
  };

  const detectedPII = [];
  let detected = false;
  
  // Check text against each pattern
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      detectedPII.push({
        type,
        value: "[REDACTED]",
        hash: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
        position: [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100) + 100]
      });
      detected = true;
    }
  }
  
  return {
    detected,
    piiItems: detectedPII,
    sanitizedText: detected ? text.replace(/\b(?:\d{4}[- ]?){3}\d{4}\b|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b|\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b|\b\d{3}[-]?\d{2}[-]?\d{4}\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b|\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct|Plaza|Square|Sq|Trail|Trl|Parkway|Pkwy|Circle|Cir)\b,?(?:\s+[A-Za-z]+,)?\s+[A-Za-z]{2}\s+\d{5}(?:-\d{4})?\b|\b[A-Z]\d{8}\b|\b(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)?\s*[A-Z][a-z]+\s+[A-Z][a-z]+\b/gi, "[REDACTED]") : text
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API route to process message with PII detection
  const messageSchema = z.object({
    text: z.string(),
    detectionLevel: z.enum(["High (Sensitive)", "Medium (Standard)", "Low (Minimal)"]).optional(),
  });

  app.post("/api/process-message", (req, res) => {
    try {
      const validatedData = messageSchema.parse(req.body);
      const piiResults = detectPII(validatedData.text);
      
      // Store PII in secure storage (only simulated here)
      if (piiResults.detected) {
        const piiData = {
          sessionId: `session-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: req.user?.id || "anonymous",
          piiItems: piiResults.piiItems
        };
        
        // In a real system, this would be stored securely
        console.log("Secure PII storage:", JSON.stringify(piiData, null, 2));
      }
      
      // Return sanitized text and detection info
      res.json({
        sanitizedText: piiResults.sanitizedText,
        piiDetected: piiResults.detected,
        piiCount: piiResults.piiItems.length,
      });
    } catch (error) {
      res.status(400).json({ 
        error: "Invalid request data",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
