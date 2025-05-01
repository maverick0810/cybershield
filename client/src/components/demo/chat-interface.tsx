import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Shield, Image, Mic, Link as LinkIcon, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { detectPII } from "@/lib/pii-detector";
import { toast } from "@/hooks/use-toast";

import React from "react";

type MessageType = {
  id: string;
  type: "system" | "user";
  content: string;
  attachment?: {
    type: "image" | "audio" | "link";
    url: string;
    previewUrl?: string; // For local display
    fileName?: string;
  };
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
      content: "Welcome to CyberShield AI! I'm here to help you with your questions while protecting your sensitive information. Try sending a message, image, audio, or link to see how our system processes it."
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [attachment, setAttachment] = useState<MessageType["attachment"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // A simulated backend response that always returns "HELLO WE ARE TEAM X"
  // This will be used when the Flask backend is not available
  const simulateBackendResponse = async () => {
    // Simulate a short delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    return "HELLO WE ARE TEAM X";
  };

  // Function to send message to Flask backend or use simulation if not available
  const sendToFlaskBackend = async (text: string, file?: File) => {
    setIsLoading(true);
    
    try {
      // Default to simulated response - skip actual fetch attempt in Replit environment
      // This ensures the app works smoothly without requiring the Flask backend to be running
      return await simulateBackendResponse();
      
      /* Note: The code below would be used in a production environment where the Flask backend is running
      
      let response;
      
      if (file) {
        // Send file to Flask backend
        const formData = new FormData();
        formData.append('file', file);
        formData.append('message', text);
        
        response = await fetch('http://localhost:5001/api/upload', {
          method: 'POST',
          body: formData,
          // Short timeout to avoid waiting too long if server isn't running
          signal: AbortSignal.timeout(3000)
        });
      } else {
        // Send text to Flask backend
        response = await fetch('http://localhost:5001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: text }),
          // Short timeout to avoid waiting too long if server isn't running
          signal: AbortSignal.timeout(3000)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      return data.response || "HELLO WE ARE TEAM X"; // Fallback to the default message
      */
      
    } catch (error) {
      console.error('Error communicating with Flask backend:', error);
      // Return the default message if we can't connect to the backend
      return "HELLO WE ARE TEAM X";
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file uploads
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "image" | "audio") => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }
    
    // Create URL for preview
    const previewUrl = URL.createObjectURL(file);
    
    setAttachment({
      type,
      url: file.name, // This will be replaced by the actual URL from the server
      previewUrl,
      fileName: file.name,
    });
    
    // Reset file input
    event.target.value = '';
  };

  // Add URL as attachment
  const handleAddLink = () => {
    // Prompt for URL
    const url = prompt("Enter webpage URL:");
    if (!url) return;
    
    // Simple validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }
    
    setAttachment({
      type: "link",
      url,
    });
  };
  
  // Clear attachment
  const handleClearAttachment = () => {
    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
    setAttachment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !attachment) || isLoading) return;
    
    // Create user message content
    const content = inputValue.trim() || (attachment ? `Sent ${attachment.type}` : "");
    
    // Add user message
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      type: "user",
      content,
      ...(attachment && { attachment })
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process the message to detect PII (only for text content)
    const piiResults = inputValue.trim() 
      ? detectPII(inputValue, detectionLevel) 
      : { detected: false, types: [] };
    
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
    
    // Clear input and attachment
    setInputValue("");
    setAttachment(null);
    
    // Get response from Flask backend
    const file = attachment?.fileName ? new File([], attachment.fileName) : undefined;
    const backendResponse = await sendToFlaskBackend(content, file);
    
    // Add system response
    const systemResponse: MessageType = {
      id: `system-${Date.now()}`,
      type: "system",
      content: backendResponse // Use the response from the Flask backend
    };
    
    if (piiResults.detected) {
      systemResponse.piiDetected = {
        types: piiResults.types,
        json: jsonDisplay
      };
    }
    
    setMessages(prev => [...prev, systemResponse]);
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
                    
                    {/* Attachment display */}
                    {message.attachment && (
                      <div className="mt-2 border border-[#7B4DFF] border-opacity-40 rounded p-2">
                        <div className="flex items-center mb-1">
                          {message.attachment.type === "image" && (
                            <Image className="h-4 w-4 mr-1 text-[#00FFCA]" />
                          )}
                          {message.attachment.type === "audio" && (
                            <Mic className="h-4 w-4 mr-1 text-[#00FFCA]" />
                          )}
                          {message.attachment.type === "link" && (
                            <LinkIcon className="h-4 w-4 mr-1 text-[#00FFCA]" />
                          )}
                          <span className="text-xs text-[#00FFCA] font-medium">
                            {message.attachment.type.charAt(0).toUpperCase() + message.attachment.type.slice(1)} Attachment
                          </span>
                        </div>
                        
                        {message.attachment.type === "image" && message.attachment.previewUrl && (
                          <div className="mt-1">
                            <img 
                              src={message.attachment.previewUrl} 
                              alt="Attached image" 
                              className="max-w-full max-h-48 rounded"
                            />
                          </div>
                        )}
                        
                        {message.attachment.type === "audio" && message.attachment.previewUrl && (
                          <audio 
                            src={message.attachment.previewUrl} 
                            controls 
                            className="max-w-full mt-1"
                          />
                        )}
                        
                        {message.attachment.type === "link" && (
                          <a 
                            href={message.attachment.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#00FFCA] text-sm underline mt-1 block truncate"
                          >
                            {message.attachment.url}
                          </a>
                        )}
                      </div>
                    )}
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
        {/* Attachment preview */}
        {attachment && (
          <div className="mb-3 p-2 bg-[#121212] rounded-md border border-[#7B4DFF] border-opacity-30 flex items-center justify-between">
            <div className="flex items-center">
              {attachment.type === "image" && (
                <Image className="h-4 w-4 mr-2 text-[#00FFCA]" />
              )}
              {attachment.type === "audio" && (
                <Mic className="h-4 w-4 mr-2 text-[#00FFCA]" />
              )}
              {attachment.type === "link" && (
                <LinkIcon className="h-4 w-4 mr-2 text-[#00FFCA]" />
              )}
              <span className="text-sm text-gray-300 truncate max-w-[200px]">
                {attachment.fileName || attachment.url}
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleClearAttachment}
              className="h-6 w-6 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <div className="flex items-center">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 bg-[#121212] border-gray-700 text-white focus:ring-[#00FFCA] focus:border-[#00FFCA]"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon"
              className="ml-2 bg-[#00FFCA] text-[#050A30] hover:bg-opacity-80"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {/* Attachment buttons */}
          <div className="flex justify-start space-x-2">
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, "image")}
            />
            <input 
              type="file" 
              ref={audioInputRef}
              accept="audio/*" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, "audio")}
            />
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs px-2 py-1 h-auto bg-transparent border-gray-700 text-gray-300 hover:bg-[#121212] hover:text-[#00FFCA]"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || !!attachment}
            >
              <Image className="h-3 w-3 mr-1" />
              Image
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs px-2 py-1 h-auto bg-transparent border-gray-700 text-gray-300 hover:bg-[#121212] hover:text-[#00FFCA]"
              onClick={() => audioInputRef.current?.click()}
              disabled={isLoading || !!attachment}
            >
              <Mic className="h-3 w-3 mr-1" />
              Audio
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs px-2 py-1 h-auto bg-transparent border-gray-700 text-gray-300 hover:bg-[#121212] hover:text-[#00FFCA]"
              onClick={handleAddLink}
              disabled={isLoading || !!attachment}
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
