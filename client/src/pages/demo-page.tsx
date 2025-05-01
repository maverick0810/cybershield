import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { ChatInterface } from "@/components/demo/chat-interface";
import { DemoControls } from "@/components/demo/demo-controls";
import { CtaSection } from "@/components/cta/cta-section";

export default function DemoPage() {
  const [detectionLevel, setDetectionLevel] = useState("Medium (Standard)");
  const [showProcessing, setShowProcessing] = useState(true);
  const [storageFormat, setStorageFormat] = useState("JSON");
  
  // Set up event handlers for demo controls
  const handleDetectionLevelChange = (level: string) => {
    setDetectionLevel(level);
  };
  
  const handleShowProcessingChange = (show: boolean) => {
    setShowProcessing(show);
  };
  
  const handleStorageFormatChange = (format: string) => {
    setStorageFormat(format);
  };
  
  // Set up example handlers to pass from DemoControls to ChatInterface
  useEffect(() => {
    const handleExampleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.hasAttribute('data-example')) {
        const exampleText = target.getAttribute('data-example');
        const messageInput = document.getElementById('messageInput') as HTMLInputElement;
        if (messageInput && exampleText) {
          messageInput.value = exampleText;
          messageInput.focus();
        }
      }
    };
    
    document.addEventListener('click', handleExampleClick);
    
    return () => {
      document.removeEventListener('click', handleExampleClick);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <section className="py-20 bg-[#050A30] relative">
          <div className="data-grid absolute inset-0 opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-bold text-3xl md:text-4xl mb-4">Try Our <span className="text-[#7B4DFF]">Live Demo</span></h1>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">Experience the power of our PII protection system with this interactive demo.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chat interface */}
              <div className="lg:col-span-2">
                <ChatInterface 
                  detectionLevel={detectionLevel}
                  showProcessing={showProcessing}
                  storageFormat={storageFormat}
                />
              </div>
              
              {/* Demo controls */}
              <div>
                <DemoControls 
                  onDetectionLevelChange={handleDetectionLevelChange}
                  onShowProcessingChange={handleShowProcessingChange}
                  onStorageFormatChange={handleStorageFormatChange}
                />
              </div>
            </div>
            
            <motion.div
              className="mt-16 bg-[#1E1E1E] rounded-xl p-8 border border-gray-800"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="font-semibold text-2xl mb-4">How This Demo Works</h2>
              <p className="text-gray-300 mb-4">
                This interactive demonstration shows how our system protects your personal information when using AI:
              </p>
              
              <ol className="space-y-3 text-gray-300">
                <li className="flex items-baseline">
                  <span className="text-[#00FFCA] mr-2">1.</span>
                  <span>Enter a message containing personal information (or use one of our examples)</span>
                </li>
                <li className="flex items-baseline">
                  <span className="text-[#00FFCA] mr-2">2.</span>
                  <span>Our system automatically detects various types of PII including names, emails, phone numbers, etc.</span>
                </li>
                <li className="flex items-baseline">
                  <span className="text-[#00FFCA] mr-2">3.</span>
                  <span>The detected PII is extracted and securely stored in a JSON format</span>
                </li>
                <li className="flex items-baseline">
                  <span className="text-[#00FFCA] mr-2">4.</span>
                  <span>Only the sanitized version of your message is processed by the AI</span>
                </li>
                <li className="flex items-baseline">
                  <span className="text-[#00FFCA] mr-2">5.</span>
                  <span>Adjust the detection level and other settings to see how our system can be customized</span>
                </li>
              </ol>
              
              <div className="mt-6 p-4 bg-[#121212] rounded-lg border border-gray-700">
                <p className="text-amber-400 font-medium mb-2">Note:</p>
                <p className="text-gray-400 text-sm">
                  This is a demonstration of our front-end capabilities. In a production environment, 
                  this system connects to our secure back-end for additional processing and 
                  integrates with your AI models via API.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
        
        <CtaSection />
      </main>
      
      <Footer />
    </div>
  );
}
