import { CreditCard, Mail, Phone, Calendar, Home, Hash, IdCard, User } from "lucide-react";
import type { ReactElement } from "react";

// Define interface for PII detection type
interface PiiType {
  type: string;
  icon: ReactElement;
}

// PII patterns
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

const sensitivity = {
  "High (Sensitive)": 0.7,
  "Medium (Standard)": 0.85,
  "Low (Minimal)": 0.95
};

// Create icon components factory functions
const createCreditCardIcon = () => ({
  type: "Credit Card",
  icon: CreditCard
});

const createMailIcon = () => ({
  type: "Email",
  icon: Mail
});

const createPhoneIcon = () => ({
  type: "Phone Number",
  icon: Phone
});

const createIdCardIcon = () => ({
  type: "SSN",
  icon: IdCard
});

const createCalendarIcon = () => ({
  type: "Date of Birth",
  icon: Calendar
});

const createHomeIcon = () => ({
  type: "Address",
  icon: Home
});

const createHashIcon = () => ({
  type: "Account Number",
  icon: Hash
});

const createUserIcon = () => ({
  type: "Name",
  icon: User
});

const createPotentialPiiIcon = () => ({
  type: "Potential PII",
  icon: IdCard
});

export function detectPII(text: string, detectionLevel: string = "Medium (Standard)") {
  const threshold = sensitivity[detectionLevel as keyof typeof sensitivity] || 0.85;
  const detectedTypes = [];
  
  // Check for credit card
  if (patterns.creditCard.test(text)) {
    detectedTypes.push(createCreditCardIcon());
  }
  
  // Check for email
  if (patterns.email.test(text)) {
    detectedTypes.push(createMailIcon());
  }
  
  // Check for phone
  if (patterns.phone.test(text)) {
    detectedTypes.push(createPhoneIcon());
  }
  
  // Check for SSN
  if (patterns.ssn.test(text)) {
    detectedTypes.push(createIdCardIcon());
  }
  
  // Check for DOB
  if (patterns.dob.test(text)) {
    detectedTypes.push(createCalendarIcon());
  }
  
  // Check for address
  if (patterns.address.test(text)) {
    detectedTypes.push(createHomeIcon());
  }
  
  // Check for account number
  if (patterns.accountNumber.test(text)) {
    detectedTypes.push(createHashIcon());
  }
  
  // Check for name
  if (patterns.name.test(text)) {
    detectedTypes.push(createUserIcon());
  }
  
  // Random detection based on sensitivity for demo purposes
  // In a real application, more sophisticated pattern matching would be used
  if (detectedTypes.length === 0 && Math.random() > threshold) {
    // Randomly detect something if nothing was detected but we're highly sensitive
    const randomTypes = [createPotentialPiiIcon()];
    return {
      detected: true,
      types: randomTypes
    };
  }
  
  return {
    detected: detectedTypes.length > 0,
    types: detectedTypes
  };
}
