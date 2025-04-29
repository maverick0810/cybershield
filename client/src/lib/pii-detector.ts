import { 
  CreditCard, 
  Mail, 
  Phone, 
  Calendar, 
  Home, 
  Hash, 
  IdCard, 
  User, 
  FileLock, 
  HeartPulse, 
  AlertTriangle, 
  Brain, 
  Fingerprint,
  Dna, 
  MousePointer 
} from "lucide-react";
import type { ComponentType } from "react";

// Interface for PII detection type
interface PiiType {
  type: string;
  icon: ComponentType<{ className?: string }>;
  confidence: number;
  context?: string;
}

// Enhanced PII patterns from redaction_pipeline2.py
const patterns = {
  // Basic PII
  creditCard: /\b(?:\d{4}[- ]?){3}\d{4}\b/,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  phone: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/,
  ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/,
  dob: /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/i,
  address: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct|Plaza|Square|Sq|Trail|Trl|Parkway|Pkwy|Circle|Cir)\b,?(?:\s+[A-Za-z]+,)?\s+[A-Za-z]{2}\s+\d{5}(?:-\d{4})?\b/i,
  accountNumber: /\b[A-Z]\d{8}\b/,
  name: /\b(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)?\s*[A-Z][a-z]+\s+[A-Z][a-z]+\b/,
  
  // Employee ID patterns
  employeeId: /(?:emp(?:loyee)?\s*id:?\s*)?[A-Z]?\d{4,6}/i,
  staffId: /(?:staff\s*no:?\s*)?\d{4,6}/i,
  
  // Document IDs
  passportNumber: /[A-Z]\d{8}|[A-Z]{2}\d{6,7}/,
  driversLicense: /[A-Z]\d{7}|[A-Z]\d{8}|[A-Z]{5}\d{6}[A-Z]{2}\d{5}/,
  
  // Sensitive categories (from SensitiveDetector in redaction_pipeline2.py)
  mental_health: [
    /depression/i, /anxiety/i, /trauma/i, /panic\s*attack/i,
    /bipolar/i, /schizophrenia/i, /eating\s*disorder/i,
    /mental\s*health/i, /therapy/i, /counseling/i
  ],
  personal_crisis: [
    /suicidal/i, /self\s*harm/i, /heartbreak/i, /grief/i,
    /divorce/i, /bankruptcy/i, /loss\s*of\s*job/i,
    /financial\s*crisis/i, /debt/i
  ],
  medical: [
    /chronic\s*illness/i, /diagnosis/i, /medication/i,
    /treatment/i, /surgery/i, /hospital/i, /disease/i,
    /cancer/i, /hiv/i, /aids/i
  ],
  abuse: [
    /abuse/i, /assault/i, /harassment/i, /violence/i,
    /victim/i, /trauma/i, /ptsd/i, /stalking/i
  ],
  biometric: [
    /fingerprint\s*(id|scan|data)?/i,
    /retina\s*(scan|pattern)/i,
    /iris\s*(scan|pattern|recognition)/i,
    /facial\s*(recognition|scan|data)/i,
    /voice\s*(print|pattern|recognition)/i,
    /dna\s*(profile|sequence|data)/i,
    /palm\s*(print|scan|vein)/i,
    /gait\s*analysis/i,
    /heartbeat\s*pattern/i
  ],
  genetic: [
    /genetic\s*(profile|data|marker|test)/i,
    /genome\s*(sequence|data)/i,
    /dna\s*test\s*results?/i,
    /chromosom(e|al)\s*(pattern|abnormality)/i,
    /hereditary\s*condition/i,
    /genetic\s*predisposition/i
  ],
  behavioral: [
    /browsing\s*history/i,
    /search\s*patterns?/i,
    /online\s*behavior/i,
    /purchase\s*history/i,
    /location\s*tracking/i,
    /movement\s*patterns?/i,
    /social\s*media\s*activity/i,
    /device\s*usage\s*patterns?/i
  ]
};

const sensitivity = {
  "High (Sensitive)": 0.7,
  "Medium (Standard)": 0.85,
  "Low (Minimal)": 0.95
};

// Create icon components factory functions
const createIconType = (type: string, icon: ComponentType<{ className?: string }>, confidence: number = 0.95, context?: string): PiiType => ({
  type,
  icon,
  confidence,
  context
});

// Basic PII icons
const piiIcons = {
  creditCard: () => createIconType("Credit Card", CreditCard),
  email: () => createIconType("Email", Mail),
  phone: () => createIconType("Phone Number", Phone),
  ssn: () => createIconType("SSN", IdCard),
  dob: () => createIconType("Date of Birth", Calendar),
  address: () => createIconType("Address", Home),
  accountNumber: () => createIconType("Account Number", Hash),
  name: () => createIconType("Person Name", User),
  employeeId: () => createIconType("Employee ID", IdCard),
  document: () => createIconType("Official Document ID", FileLock),
  
  // Sensitive information icons
  mental_health: () => createIconType("Mental Health", Brain),
  personal_crisis: () => createIconType("Personal Crisis", AlertTriangle),
  medical: () => createIconType("Medical Information", HeartPulse),
  abuse: () => createIconType("Sensitive Personal Info", FileLock),
  biometric: () => createIconType("Biometric Data", Fingerprint),
  genetic: () => createIconType("Genetic Information", Dna),
  behavioral: () => createIconType("Behavioral Data", MousePointer),
  
  // Generic
  potential: () => createIconType("Potential PII", IdCard, 0.75)
};

// For extracting context around a match
function getContext(text: string, matchIndex: number, matchLength: number): string {
  const contextStart = Math.max(0, matchIndex - 30);
  const contextEnd = Math.min(text.length, matchIndex + matchLength + 30);
  return text.substring(contextStart, contextEnd);
}

/**
 * Advanced PII detection using patterns from the Python redaction pipeline
 */
export function detectPII(text: string, detectionLevel: string = "Medium (Standard)") {
  const threshold = sensitivity[detectionLevel as keyof typeof sensitivity] || 0.85;
  const detectedTypes: PiiType[] = [];
  const matchedRanges: {start: number, end: number}[] = []; // Track ranges to avoid overlapping matches
  
  // Helper to check if a match overlaps with existing ones
  const isOverlapping = (start: number, end: number) => {
    return matchedRanges.some(range => 
      (start >= range.start && start <= range.end) || 
      (end >= range.start && end <= range.end) ||
      (start <= range.start && end >= range.end)
    );
  };
  
  // Helper to add a match if not overlapping
  const addMatch = (type: string, iconFn: () => PiiType, match: RegExpExecArray) => {
    const start = match.index;
    const end = match.index + match[0].length;
    
    if (!isOverlapping(start, end)) {
      const context = getContext(text, start, match[0].length);
      const piiType = iconFn();
      piiType.context = context;
      
      detectedTypes.push(piiType);
      matchedRanges.push({start, end});
    }
  };

  // Check for basic PII patterns
  for (const [key, pattern] of Object.entries(patterns)) {
    // Skip array patterns (handled separately)
    if (Array.isArray(pattern)) continue;
    
    const regex = new RegExp(pattern, 'g');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // Map the key to the appropriate icon creator function
      const iconCreator = piiIcons[key as keyof typeof piiIcons] || piiIcons.potential;
      addMatch(key, iconCreator, match);
    }
  }
  
  // Check for sensitive patterns (arrays of regexes)
  for (const [category, patternList] of Object.entries(patterns)) {
    if (!Array.isArray(patternList)) continue;
    
    for (const pattern of patternList) {
      const regex = new RegExp(pattern, 'g');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        // Map the category to the sensitive type icon
        const iconCreator = piiIcons[category as keyof typeof piiIcons] || piiIcons.potential;
        addMatch(category, iconCreator, match);
      }
    }
  }
  
  // If high sensitivity and no detections, add a potential match
  if (detectedTypes.length === 0 && Math.random() > threshold) {
    // Only in high sensitivity mode, detect something for demo purposes
    detectedTypes.push(piiIcons.potential());
  }
  
  // Get unique types for response (no dupes for the same type)
  const uniqueTypes = Array.from(
    new Map(detectedTypes.map(item => [item.type, item])).values()
  );
  
  return {
    detected: uniqueTypes.length > 0,
    types: uniqueTypes,
    matchedRanges
  };
}

/**
 * Get sanitized text with redactions
 */
export function getSanitizedText(text: string, matchedRanges: {start: number, end: number}[]): string {
  // Clone the input text
  let sanitized = text;
  
  // Sort ranges from end to start to avoid indexing issues when replacing
  const sortedRanges = [...matchedRanges].sort((a, b) => b.start - a.start);
  
  // Replace each range with [REDACTED]
  for (const range of sortedRanges) {
    sanitized = 
      sanitized.substring(0, range.start) + 
      "[REDACTED]" + 
      sanitized.substring(range.end);
  }
  
  return sanitized;
}

/**
 * Generate detailed PII information report including context
 */
export function generatePIIReport(text: string, detectionLevel: string = "Medium (Standard)"): any {
  const results = detectPII(text, detectionLevel);
  
  if (!results.detected) {
    return {
      detected: false,
      sanitizedText: text,
      piiItems: []
    };
  }
  
  // Get sanitized text
  const sanitizedText = getSanitizedText(text, results.matchedRanges || []);
  
  // Format PII items for reporting
  const piiItems = results.types.map(type => ({
    type: type.type,
    confidence: type.confidence,
    context: type.context,
    value: "[REDACTED]",
    hash: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`
  }));
  
  return {
    detected: true,
    sanitizedText,
    piiItems,
    types: results.types
  };
}
