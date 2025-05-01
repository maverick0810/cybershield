import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Shield,
  FileImage,
  FileAudio,
  Globe,
  X,
  Upload,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { generatePIIReport } from "@/lib/pii-detector";
import { apiRequest } from "@/lib/queryClient";

import React from "react";

type MessageType = {
  id: string;
  type: "system" | "user";
  content: string;
  contentType?: "text" | "image" | "audio" | "webpage";
  fileName?: string; // For file uploads
  url?: string; // For webpage content
  piiDetected?: {
    types: Array<{
      type: string;
      icon: React.ComponentType<{ className?: string }>;
    }>;
    json?: string;
    piiSanitizedText?: string; // Sanitized text with redacted sensitive info
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
      content: "Welcome to CyberShield AI! I'm here to help you with your questions while protecting your sensitive information. Try sending a message that contains personal information to see how our system detects and secures it. You can also process images, audio, or webpages for PII detection."
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [webpageUrl, setWebpageUrl] = useState("");
  const [contentType, setContentType] = useState<"text" | "image" | "audio" | "webpage">("text");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Store the Python backend URL - replace with your ngrok/localtunnel URL when running your server
  const PYTHON_BACKEND_URL = "REPLACE_WITH_YOUR_PUBLIC_URL"; // Example: "https://abcd1234.ngrok.io"
  
  // Process text input through Python backend API
  const processTextMessage = async (text: string) => {
    try {
      setIsLoading(true);
      
      // Add user message
      const userMessage: MessageType = {
        id: `user-${Date.now()}`,
        type: "user",
        content: text,
        contentType: "text"
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Process the text message using your Python server with public URL
      try {
        // Check if Python backend URL has been set
        if (PYTHON_BACKEND_URL === "REPLACE_WITH_YOUR_PUBLIC_URL") {
          throw new Error("Python backend URL not configured");
        }
        
        const response = await fetch(`${PYTHON_BACKEND_URL}/api/process-python`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            detectionLevel,
            contentType: "text"
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Python server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Using Python backend processing", data);
        
        // Prepare the system response
        let systemResponse: MessageType = {
          id: `system-${Date.now()}`,
          type: "system",
          content: data.llmResponse || "I've processed your message.",
          contentType: "text"
        };
        
        // Generate JSON if PII is detected
        if (data.piiDetected) {
          // Get frontend-side PII detection for UI components
          const frontendResults = generatePIIReport(text, detectionLevel);
          
          // Format PII data for display
          const jsonData = {
            session_id: `session-${Date.now()}`,
            timestamp: new Date().toISOString(),
            pii_items: data.piiItems || []
          };
          
          const jsonDisplay = JSON.stringify(jsonData, null, 2);
          
          systemResponse.piiDetected = {
            types: frontendResults.types,
            json: jsonDisplay,
            piiSanitizedText: data.sanitizedText
          };
        }
        
        setMessages(prev => [...prev, systemResponse]);
        setInputValue("");
      } catch (pythonError) {
        console.error("Python backend error:", pythonError);
        
        // Fallback to regular backend if Python isn't available
        console.log("Falling back to standard backend processing");
        const response = await apiRequest("POST", "/api/process-message", {
          text,
          detectionLevel,
          contentType: "text"
        });
        
        const data = await response.json();
        
        // Prepare the system response
        let systemResponse: MessageType = {
          id: `system-${Date.now()}`,
          type: "system",
          content: data.llmResponse || "I've processed your message.",
          contentType: "text"
        };
        
        // Generate JSON if PII is detected
        if (data.piiDetected) {
          // Get frontend-side PII detection for UI components
          const frontendResults = generatePIIReport(text, detectionLevel);
          
          // Format PII data for display
          const jsonData = {
            session_id: `session-${Date.now()}`,
            timestamp: new Date().toISOString(),
            pii_items: data.piiItems || []
          };
          
          const jsonDisplay = JSON.stringify(jsonData, null, 2);
          
          systemResponse.piiDetected = {
            types: frontendResults.types,
            json: jsonDisplay,
            piiSanitizedText: data.sanitizedText
          };
        }
        
        setMessages(prev => [...prev, systemResponse]);
        setInputValue("");
      }
      
    } catch (error) {
      console.error("Error processing message:", error);
      
      // Add error message
      const errorMessage: MessageType = {
        id: `system-error-${Date.now()}`,
        type: "system",
        content: "Sorry, there was an error processing your message. Please try again."
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsLoading(false);
    }
  };

  // Process file uploads (image/audio)
  const processFileUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setIsLoading(true);
      
      // Create file upload form data
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("contentType", contentType);
      formData.append("detectionLevel", detectionLevel);
      
      // Add user message showing file upload
      const userMessage: MessageType = {
        id: `user-${Date.now()}`,
        type: "user",
        content: `Uploaded ${contentType} file: ${selectedFile.name}`,
        contentType: contentType,
        fileName: selectedFile.name
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      try {
        // Check if Python backend URL has been set
        if (PYTHON_BACKEND_URL === "REPLACE_WITH_YOUR_PUBLIC_URL") {
          throw new Error("Python backend URL not configured");
        }
        
        // Try the Python backend first
        const response = await fetch(`${PYTHON_BACKEND_URL}/api/process-python`, {
          method: "POST",
          body: formData,
        });
        
        const data = await response.json();
        
        // Prepare system response
        let systemResponse: MessageType = {
          id: `system-${Date.now()}`,
          type: "system",
          content: data.llmResponse || `I've processed your ${contentType} file.`,
          contentType: contentType,
          fileName: selectedFile.name
        };
        
        // Handle PII detection results
        if (data.piiDetected) {
          // For frontend display, use the extracted text to generate visual elements
          const frontendResults = generatePIIReport(data.originalText || "", "High (Sensitive)");
          
          // Format PII data for display
          const jsonData = {
            session_id: `session-${Date.now()}`,
            timestamp: new Date().toISOString(),
            content_type: contentType,
            file_name: selectedFile.name,
            pii_items: data.piiItems || []
          };
          
          const jsonDisplay = JSON.stringify(jsonData, null, 2);
          
          systemResponse.piiDetected = {
            types: frontendResults.types,
            json: jsonDisplay,
            piiSanitizedText: data.sanitizedText
          };
        }
        
        setMessages(prev => [...prev, systemResponse]);
        setSelectedFile(null);
      } catch (pythonError) {
        console.error("Python backend error:", pythonError);
        
        // Fall back to the standard backend
        console.log("Falling back to standard backend processing");
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        
        const data = await response.json();
        
        // Prepare system response
        let systemResponse: MessageType = {
          id: `system-${Date.now()}`,
          type: "system",
          content: data.llmResponse || `I've processed your ${contentType} file.`,
          contentType: contentType,
          fileName: selectedFile.name
        };
        
        // Handle PII detection results
        if (data.piiDetected) {
          // For frontend display, use the extracted text to generate visual elements
          const frontendResults = generatePIIReport(data.originalText || "", "High (Sensitive)");
          
          // Format PII data for display
          const jsonData = {
            session_id: `session-${Date.now()}`,
            timestamp: new Date().toISOString(),
            content_type: contentType,
            file_name: selectedFile.name,
            pii_items: data.piiItems || []
          };
          
          const jsonDisplay = JSON.stringify(jsonData, null, 2);
          
          systemResponse.piiDetected = {
            types: frontendResults.types,
            json: jsonDisplay,
            piiSanitizedText: data.sanitizedText
          };
        }
        
        setMessages(prev => [...prev, systemResponse]);
        setSelectedFile(null);
      }
      
    } catch (error) {
      console.error(`Error processing ${contentType} file:`, error);
      
      // Add error message
      const errorMessage: MessageType = {
        id: `system-error-${Date.now()}`,
        type: "system",
        content: `Sorry, there was an error processing your ${contentType} file. Please try again.`
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsLoading(false);
    }
  };

  // Process webpage content
  const processWebpage = async () => {
    if (!webpageUrl.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Add user message showing webpage processing
      const userMessage: MessageType = {
        id: `user-${Date.now()}`,
        type: "user",
        content: `Processing webpage: ${webpageUrl}`,
        contentType: "webpage",
        url: webpageUrl
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      try {
        // Check if Python backend URL has been set
        if (PYTHON_BACKEND_URL === "REPLACE_WITH_YOUR_PUBLIC_URL") {
          throw new Error("Python backend URL not configured");
        }
        
        // Try the Python backend first
        const response = await fetch(`${PYTHON_BACKEND_URL}/api/process-python`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: webpageUrl,
            detectionLevel,
            contentType: "webpage"
          }),
        });
        
        const data = await response.json();
        
        // Prepare system response
        let systemResponse: MessageType = {
          id: `system-${Date.now()}`,
          type: "system",
          content: data.llmResponse || "I've processed the webpage content.",
          contentType: "webpage",
          url: webpageUrl
        };
        
        // Handle PII detection results
        if (data.piiDetected) {
          // For frontend display, use sanitized text to generate visual elements
          const frontendResults = generatePIIReport(data.originalText || "", detectionLevel);
          
          // Format PII data for display
          const jsonData = {
            session_id: `session-${Date.now()}`,
            timestamp: new Date().toISOString(),
            content_type: "webpage",
            url: webpageUrl,
            pii_items: data.piiItems || []
          };
          
          const jsonDisplay = JSON.stringify(jsonData, null, 2);
          
          systemResponse.piiDetected = {
            types: frontendResults.types,
            json: jsonDisplay,
            piiSanitizedText: data.sanitizedText
          };
        }
        
        setMessages(prev => [...prev, systemResponse]);
        setWebpageUrl("");
      } catch (pythonError) {
        console.error("Python backend error:", pythonError);
        
        // Fall back to the standard backend
        console.log("Falling back to standard backend processing");
        // Process webpage content on the server
        const response = await apiRequest("POST", "/api/process-webpage", {
          url: webpageUrl
        });
        
        const data = await response.json();
        
        // Prepare system response
        let systemResponse: MessageType = {
          id: `system-${Date.now()}`,
          type: "system",
          content: data.llmResponse || "I've processed the webpage content.",
          contentType: "webpage",
          url: webpageUrl
        };
        
        // Handle PII detection results
        if (data.piiDetected) {
          // For frontend display, use sanitized text to generate visual elements
          const frontendResults = generatePIIReport(data.sanitizedText || "", detectionLevel);
          
          // Format PII data for display
          const jsonData = {
            session_id: `session-${Date.now()}`,
            timestamp: new Date().toISOString(),
            content_type: "webpage",
            url: webpageUrl,
            pii_items: data.piiItems || []
          };
          
          const jsonDisplay = JSON.stringify(jsonData, null, 2);
          
          systemResponse.piiDetected = {
            types: frontendResults.types,
            json: jsonDisplay,
            piiSanitizedText: data.sanitizedText
          };
        }
        
        setMessages(prev => [...prev, systemResponse]);
        setWebpageUrl("");
      }
      
    } catch (error) {
      console.error("Error processing webpage:", error);
      
      // Add error message
      const errorMessage: MessageType = {
        id: `system-error-${Date.now()}`,
        type: "system",
        content: "Sorry, there was an error processing the webpage. Please check the URL and try again."
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submissions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (contentType) {
      case "text":
        if (inputValue.trim()) {
          processTextMessage(inputValue);
        }
        break;
        
      case "image":
      case "audio":
        if (selectedFile) {
          processFileUpload();
        }
        break;
        
      case "webpage":
        if (webpageUrl.trim()) {
          processWebpage();
        }
        break;
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Trigger file input click
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Clear selected file
  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
                      {message.contentType && message.contentType !== "text" && (
                        <div className="mb-2 text-xs text-[#00FFCA] flex items-center">
                          {message.contentType === "image" && <FileImage className="h-3 w-3 mr-1" />}
                          {message.contentType === "audio" && <FileAudio className="h-3 w-3 mr-1" />}
                          {message.contentType === "webpage" && <Globe className="h-3 w-3 mr-1" />}
                          <span>
                            {message.contentType === "image" && "Image processed: "}
                            {message.contentType === "audio" && "Audio processed: "}
                            {message.contentType === "webpage" && "Webpage processed: "}
                            {message.fileName || message.url}
                          </span>
                        </div>
                      )}
                      
                      {message.piiDetected && (
                        <div className="border-b border-gray-700 pb-3 mb-3">
                          <div className="flex items-center">
                            <Shield className="text-[#00FFCA] mr-2 h-4 w-4" />
                            <p className="text-gray-400 text-xs">AI received redacted version:</p>
                          </div>
                          <p className="mt-1 text-gray-400 text-sm italic">
                            {message.piiDetected.piiSanitizedText || "Content with redacted sensitive information"}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center mb-1">
                          <Bot className="text-[#31E1F7] mr-2 h-4 w-4" />
                          <p className="text-[#31E1F7] text-xs">AI Assistant Response:</p>
                        </div>
                        <p className="text-gray-200 whitespace-pre-line">{message.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-end">
                  <div className="bg-[#7B4DFF] bg-opacity-20 rounded-lg rounded-tr-none p-3 max-w-3xl">
                    {message.contentType && message.contentType !== "text" && (
                      <div className="mb-2 text-xs text-white flex items-center">
                        {message.contentType === "image" && <FileImage className="h-3 w-3 mr-1" />}
                        {message.contentType === "audio" && <FileAudio className="h-3 w-3 mr-1" />}
                        {message.contentType === "webpage" && <Globe className="h-3 w-3 mr-1" />}
                        <span>
                          {message.contentType === "image" && "Image: "}
                          {message.contentType === "audio" && "Audio: "}
                          {message.contentType === "webpage" && "Webpage: "}
                          {message.fileName || message.url}
                        </span>
                      </div>
                    )}
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
        <Tabs 
          defaultValue="text" 
          value={contentType}
          onValueChange={(value) => setContentType(value as any)}
          className="w-full"
        >
          <TabsList className="mb-3 bg-[#121212] border border-gray-700 p-1">
            <TabsTrigger value="text" className="data-[state=active]:bg-[#7B4DFF] data-[state=active]:text-white">
              Text
            </TabsTrigger>
            <TabsTrigger value="image" className="data-[state=active]:bg-[#7B4DFF] data-[state=active]:text-white">
              Image
            </TabsTrigger>
            <TabsTrigger value="audio" className="data-[state=active]:bg-[#7B4DFF] data-[state=active]:text-white">
              Audio
            </TabsTrigger>
            <TabsTrigger value="webpage" className="data-[state=active]:bg-[#7B4DFF] data-[state=active]:text-white">
              Webpage
            </TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="w-full">
            <TabsContent value="text" className="mt-0">
              <div className="flex items-center">
                <Input
                  id="messageInput"
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
                  disabled={!inputValue.trim() || isLoading}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="image" className="mt-0">
              <div className="flex items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex-1 bg-[#121212] border border-gray-700 rounded-md px-3 py-2 text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <FileImage className="h-4 w-4 mr-2 text-[#00FFCA]" />
                      <span className="truncate">{selectedFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleClearFile}
                      className="h-6 w-6 text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    className="flex-1 bg-[#121212] border border-gray-700 text-gray-300 hover:bg-[#1A1A1A] hover:text-white justify-start"
                    onClick={handleFileInputClick}
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select image file
                  </Button>
                )}
                <Button 
                  type="submit" 
                  size="icon"
                  className="ml-2 bg-[#00FFCA] text-[#050A30] hover:bg-opacity-80"
                  disabled={!selectedFile || isLoading}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="audio" className="mt-0">
              <div className="flex items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex-1 bg-[#121212] border border-gray-700 rounded-md px-3 py-2 text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <FileAudio className="h-4 w-4 mr-2 text-[#00FFCA]" />
                      <span className="truncate">{selectedFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleClearFile}
                      className="h-6 w-6 text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    className="flex-1 bg-[#121212] border border-gray-700 text-gray-300 hover:bg-[#1A1A1A] hover:text-white justify-start"
                    onClick={handleFileInputClick}
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select audio file
                  </Button>
                )}
                <Button 
                  type="submit" 
                  size="icon"
                  className="ml-2 bg-[#00FFCA] text-[#050A30] hover:bg-opacity-80"
                  disabled={!selectedFile || isLoading}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="webpage" className="mt-0">
              <div className="flex items-center">
                <Input
                  value={webpageUrl}
                  onChange={(e) => setWebpageUrl(e.target.value)}
                  placeholder="Enter webpage URL here..."
                  className="flex-1 bg-[#121212] border-gray-700 text-white focus:ring-[#00FFCA] focus:border-[#00FFCA]"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  className="ml-2 bg-[#00FFCA] text-[#050A30] hover:bg-opacity-80"
                  disabled={!webpageUrl.trim() || isLoading}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </div>
    </div>
  );
}
