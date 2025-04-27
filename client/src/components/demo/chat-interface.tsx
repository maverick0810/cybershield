import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { detectPII } from "@/lib/pii-detector";

import React from "react";

type MessageType = {
  id: string;
  type: "system" | "user";
  content: string;
  piiDetected?: {
    types: Array<{
      type: string;
      icon: React.ComponentType<{ className?: string }>;
    }>;
    json?: string;
  };
};

interface ChatInterfaceProps {
  detectionLevel: string;
  showProcessing: boolean;
  storageFormat: string;
}

export function ChatInterface({ 
  detectionLevel = "Medium (Standard)", 
  showProcessing = true,
  storageFormat = "JSON"
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "welcome",
      type: "system",
      content: "Welcome to CyberShield AI! I'm here to help you with your questions while protecting your sensitive information. Try sending a message that contains personal information to see how our system detects and secures it."
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process the message to detect PII
    const piiResults = detectPII(inputValue, detectionLevel);
    
    // Format JSON based on detected PII
    let jsonDisplay = "";
    if (piiResults.detected && piiResults.types.length > 0) {
      const jsonData = {
        session_id: `${Math.random().toString(36).substring(2, 10)}`,
        timestamp: new Date().toISOString(),
        pii_items: piiResults.types.map(type => ({
          type: type.type,
          value: "[ENCRYPTED]",
          hash: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
          position: [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100) + 100]
        }))
      };
      
      jsonDisplay = JSON.stringify(jsonData, null, 2);
    }
    
    // Clear input
    setInputValue("");
    
    // Add system response with delay to simulate processing
    setTimeout(() => {
      const systemResponse: MessageType = {
        id: `system-${Date.now()}`,
        type: "system",
        content: piiResults.detected 
          ? "I've detected and secured the sensitive information in your message. This data has been stored safely and not shared with the AI processing system. How else can I assist you today?"
          : "Thank you for your message. No sensitive information was detected. How else can I assist you today?"
      };
      
      if (piiResults.detected) {
        systemResponse.piiDetected = {
          types: piiResults.types,
          json: jsonDisplay
        };
      }
      
      setMessages(prev => [...prev, systemResponse]);
    }, 1000);
  };
  
  const handleExampleClick = (example: string) => {
    setInputValue(example);
  };

  return (
    <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-xl border border-gray-800">
      <div className="p-4 bg-[#121212] border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#00FFCA] mr-2 animate-pulse"></div>
          <h3 className="font-medium">CyberShield AI Assistant</h3>
        </div>
      </div>
      
      <div 
        className="h-96 overflow-y-auto p-4 space-y-4" 
        ref={chatContainerRef}
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {message.type === "system" ? (
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-[#31E1F7] flex items-center justify-center text-[#050A30] flex-shrink-0 mr-3">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    {message.piiDetected && (
                      <div className="bg-[#00FFCA] bg-opacity-10 rounded-lg rounded-tl-none p-3 mb-2 border border-[#00FFCA] border-opacity-30">
                        <div className="flex items-center mb-2">
                          <Shield className="text-[#00FFCA] mr-2 h-5 w-5" />
                          <p className="text-[#00FFCA] font-medium">PII Detection Alert</p>
                        </div>
                        <p className="text-gray-300 text-sm">Personal Identifiable Information detected and secured:</p>
                        <ul className="mt-1 space-y-1 text-sm text-gray-300">
                          {message.piiDetected.types.map((type, idx) => {
                            const IconComponent = type.icon;
                            return (
                              <li key={idx} className="flex items-center">
                                <div className="text-[#00FFCA] mr-2">
                                  <IconComponent className="text-xs h-3 w-3" />
                                </div>
                                <span>{type.type}: <span className="text-[#00FFCA]">[SECURED]</span></span>
                              </li>
                            );
                          })}
                        </ul>
                        
                        {showProcessing && message.piiDetected.json && (
                          <div className="mt-3">
                            <p className="text-gray-300 text-sm mb-1">Secure storage ({storageFormat}):</p>
                            <div className="bg-[#121212] rounded-md p-2 overflow-x-auto text-xs">
                              <pre className="text-gray-300">{message.piiDetected.json}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="bg-[#121212] rounded-lg rounded-tl-none p-3 max-w-3xl">
                      <p className="text-gray-300">{message.content}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-end">
                  <div className="bg-[#7B4DFF] bg-opacity-20 rounded-lg rounded-tr-none p-3 max-w-3xl">
                    <p className="text-white">{message.content}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#7B4DFF] flex items-center justify-center text-[#050A30] flex-shrink-0 ml-3">
                    <User className="h-5 w-5" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 bg-[#121212] border-gray-700 text-white focus:ring-[#00FFCA] focus:border-[#00FFCA]"
          />
          <Button 
            type="submit" 
            size="icon"
            className="ml-2 bg-[#00FFCA] text-[#050A30] hover:bg-opacity-80"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
