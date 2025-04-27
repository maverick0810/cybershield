import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { ProcessStep } from "@/components/how-it-works/process-step";
import { CtaSection } from "@/components/cta/cta-section";
import { 
  Keyboard, 
  Database, 
  Bot, 
  Reply 
} from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      align: "left",
      index: 0,
      title: "User Input Processing",
      description: "When you input data, our system immediately scans for personal identifiable information such as names, addresses, phone numbers, and other sensitive details.",
      codeExample: `def process_user_input(input_text):
    # Scan for PII patterns
    pii_detected = pii_scanner.detect(input_text)
    
    if pii_detected:
        # Extract and secure PII
        cleaned_text = pii_scanner.redact(input_text)
        return cleaned_text, pii_detected
    else:
        return input_text, None`,
      icon: <Keyboard className="text-[#050A30] h-5 w-5" />,
      hexagonColor: "bg-[#00FFCA]"
    },
    {
      align: "right",
      index: 1,
      title: "Secure PII Storage",
      description: "Detected PII is extracted and stored in an encrypted JSON file with a reference key. The original text is replaced with placeholders to maintain context while protecting sensitive data.",
      codeExample: `# Secure JSON storage for PII
pii_data = {
    "session_id": "a1b2c3d4",
    "timestamp": "2023-06-15T14:30:00Z",
    "pii_items": [
        {
            "type": "EMAIL",
            "value": "[REDACTED]",
            "hash": "f58a...3d2e",
            "position": [24, 46]
        },
        {
            "type": "PHONE",
            "value": "[REDACTED]",
            "hash": "c72b...9f1a",
            "position": [102, 115]
        }
    ]
}`,
      icon: <Database className="text-[#050A30] h-5 w-5" />,
      hexagonColor: "bg-[#31E1F7]"
    },
    {
      align: "left",
      index: 2,
      title: "AI Model Integration",
      description: "The sanitized text is then processed by the AI model, ensuring that no sensitive information is exposed to third-party services. The system works with multiple API providers including Gemini.",
      codeExample: `async def process_with_ai(sanitized_text):
    # Send to Gemini API
    response = await gemini_api.generate_content(
        sanitized_text,
        safety_settings=ENHANCED_SAFETY
    )
    
    # Verify response contains no PII
    verified_response = verify_output(response)
    
    return verified_response`,
      icon: <Bot className="text-[#050A30] h-5 w-5" />,
      hexagonColor: "bg-[#7B4DFF]"
    },
    {
      align: "right",
      index: 3,
      title: "Secure Response Delivery",
      description: "After processing, the system can selectively restore PII context for authorized users or maintain the sanitized version. This ensures data is only accessible to those with proper permissions.",
      codeExample: `def restore_user_context(response, session_id):
    # Retrieve stored PII for this session
    stored_pii = pii_storage.get(session_id)
    
    # Reconstruct complete response with PII context
    if request.user.has_permission("view_pii"):
        complete_response = context_manager.reconstruct(
            response, 
            stored_pii
        )
        return complete_response
    else:
        return response`,
      icon: <Reply className="text-[#050A30] h-5 w-5" />,
      hexagonColor: "bg-[#00FFCA]"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <section className="py-20 gradient-bg relative">
          <div className="data-grid absolute inset-0 opacity-20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-bold text-3xl md:text-4xl mb-4">How <span className="text-[#31E1F7]">It Works</span></h1>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">A technical overview of our PII protection system and its integration with your data flow.</p>
            </motion.div>
            
            <motion.div 
              className="relative py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Connection line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-700 transform -translate-x-1/2 hidden md:block"></div>
              
              {/* Steps */}
              <div className="space-y-24">
                {steps.map((step, index) => (
                  <ProcessStep 
                    key={index}
                    align={step.align}
                    index={step.index}
                    title={step.title}
                    description={step.description}
                    codeExample={step.codeExample}
                    icon={step.icon}
                    hexagonColor={step.hexagonColor}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </section>
        
        <section className="py-20 bg-[#1A1A40]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="font-bold text-3xl md:text-4xl mb-4">The <span className="text-[#00FFCA]">Technical Architecture</span></h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">Our system is built on a modern, scalable stack designed for security and performance.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-800">
                  <h3 className="font-semibold text-xl mb-4">Frontend Layer</h3>
                  <ul className="space-y-3">
                    <li className="flex items-baseline">
                      <div className="w-2 h-2 rounded-full bg-[#00FFCA] mr-3 mt-1.5"></div>
                      <span className="text-gray-300">React.js for responsive UI with Framer Motion animations</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="w-2 h-2 rounded-full bg-[#00FFCA] mr-3 mt-1.5"></div>
                      <span className="text-gray-300">TailwindCSS for styling and responsive design</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="w-2 h-2 rounded-full bg-[#00FFCA] mr-3 mt-1.5"></div>
                      <span className="text-gray-300">Real-time PII detection with client-side processing</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-800 mt-6">
                  <h3 className="font-semibold text-xl mb-4">Backend Layer</h3>
                  <ul className="space-y-3">
                    <li className="flex items-baseline">
                      <div className="w-2 h-2 rounded-full bg-[#31E1F7] mr-3 mt-1.5"></div>
                      <span className="text-gray-300">Express.js server for API endpoints and authentication</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="w-2 h-2 rounded-full bg-[#31E1F7] mr-3 mt-1.5"></div>
                      <span className="text-gray-300">Secure storage system for PII data using encryption</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="w-2 h-2 rounded-full bg-[#31E1F7] mr-3 mt-1.5"></div>
                      <span className="text-gray-300">API integration with Gemini and other LLM providers</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-800">
                  <h3 className="font-semibold text-xl mb-4">PII Processing Engine</h3>
                  <ul className="space-y-3">
                    <li className="flex items-baseline">
                      <div className="w-2 h-2 rounded-full bg-[#7B4DFF] mr-3 mt-1.5"></div>
                      <span className="text-gray-300">Advanced pattern recognition using machine learning</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="w-2 h-2 rounded-full bg-[#7B4DFF] mr-3 mt-1.5"></div>
                      <span className="text-gray-300">Contextual analysis to reduce false positives</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="w-2 h-2 rounded-full bg-[#7B4DFF] mr-3 mt-1.5"></div>
                      <span className="text-gray-300">Real-time content sanitization and placeholder insertion</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-800 mt-6">
                  <h3 className="font-semibold text-xl mb-4">Security Layer</h3>
                  <ul className="space-y-3">
                    <li className="flex items-baseline">
                      <div className="w-2 h-2 rounded-full bg-[#00FFCA] mr-3 mt-1.5"></div>
                      <span className="text-gray-300">AES-256 encryption for all stored PII data</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="w-2 h-2 rounded-full bg-[#00FFCA] mr-3 mt-1.5"></div>
                      <span className="text-gray-300">Role-based access control for data retrieval</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="w-2 h-2 rounded-full bg-[#00FFCA] mr-3 mt-1.5"></div>
                      <span className="text-gray-300">Comprehensive audit logging of all data access</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="w-2 h-2 rounded-full bg-[#00FFCA] mr-3 mt-1.5"></div>
                      <span className="text-gray-300">Secure communication with end-to-end encryption</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        <CtaSection />
      </main>
      
      <Footer />
    </div>
  );
}
