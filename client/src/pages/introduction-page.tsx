import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { 
  Shield, 
  Lock, 
  Bot, 
  Search, 
  Database, 
  FileJson, 
  Code,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";

export default function IntroductionPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <section className="py-16 gradient-bg relative">
          <div className="data-grid absolute inset-0 opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-bold text-4xl md:text-5xl mb-6">
                Introducing <span className="text-[#00FFCA] glow-effect">CyberShield AI</span>
              </h1>
              <p className="text-xl text-gray-300 mb-10">
                A revolutionary platform that protects your personal information while allowing you to harness the full power of modern AI language models.
              </p>
              <div className="flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1633265486501-0cf524a07213?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="AI cybersecurity concept" 
                  className="rounded-xl shadow-2xl max-h-96 object-cover"
                />
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
              <h2 className="font-bold text-3xl md:text-4xl mb-4">
                The Problem We're <span className="text-[#31E1F7]">Solving</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Traditional AI systems often store and process all your data, including sensitive personal information, creating privacy and security risks.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                className="bg-[#1E1E1E] rounded-xl p-6 shadow-xl border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-14 h-14 rounded-lg bg-red-500 bg-opacity-20 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-xl mb-3">Privacy Concerns</h3>
                <p className="text-gray-400">
                  When interacting with AI, your personal information can be stored in logs, training data, and model memory, potentially exposing it to unauthorized access.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-[#1E1E1E] rounded-xl p-6 shadow-xl border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-14 h-14 rounded-lg bg-amber-500 bg-opacity-20 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-xl mb-3">Data Security Risks</h3>
                <p className="text-gray-400">
                  Third-party AI providers may not have adequate security measures to protect your sensitive data from breaches or unauthorized access.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-[#1E1E1E] rounded-xl p-6 shadow-xl border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="w-14 h-14 rounded-lg bg-purple-500 bg-opacity-20 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="font-semibold text-xl mb-3">Compliance Issues</h3>
                <p className="text-gray-400">
                  Using AI with PII can lead to regulatory compliance problems with GDPR, CCPA, HIPAA, and other data protection regulations.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-[#050A30]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="font-bold text-3xl md:text-4xl mb-4">
                Our <span className="text-[#00FFCA]">Solution</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                CyberShield AI creates a secure layer between you and AI language models, protecting your personal information while preserving AI functionality.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="AI security technology" 
                  className="rounded-xl shadow-xl"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="font-semibold text-2xl mb-6">How CyberShield AI Works:</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#00FFCA] bg-opacity-20 flex items-center justify-center mr-4">
                      <Search className="h-5 w-5 text-[#00FFCA]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-xl mb-1">Intelligent PII Detection</h4>
                      <p className="text-gray-400">Our system uses advanced algorithms to identify over 20 types of personal identifiable information in real-time.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#31E1F7] bg-opacity-20 flex items-center justify-center mr-4">
                      <Database className="h-5 w-5 text-[#31E1F7]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-xl mb-1">Secure Local Storage</h4>
                      <p className="text-gray-400">Detected PII is extracted and securely stored in encrypted JSON files under your control.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#7B4DFF] bg-opacity-20 flex items-center justify-center mr-4">
                      <Bot className="h-5 w-5 text-[#7B4DFF]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-xl mb-1">Sanitized AI Processing</h4>
                      <p className="text-gray-400">Only anonymized data is sent to AI models like Gemini, ensuring your personal information remains private.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#00FFCA] bg-opacity-20 flex items-center justify-center mr-4">
                      <FileJson className="h-5 w-5 text-[#00FFCA]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-xl mb-1">Comprehensive JSON History</h4>
                      <p className="text-gray-400">All interactions are tracked with detailed logs, giving you full visibility and control over your data.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Link href="/how-it-works">
                    <a className="inline-flex items-center font-medium text-[#00FFCA] hover:text-white transition-colors">
                      See detailed technical flow <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-[#000C66]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="font-bold text-3xl md:text-4xl mb-4">
                Key <span className="text-[#7B4DFF]">Benefits</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Experience the advantages of using CyberShield AI for your machine learning applications.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div 
                className="bg-[#1E1E1E] rounded-xl p-6 shadow-xl border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Shield className="h-10 w-10 text-[#00FFCA] mb-4" />
                <h3 className="font-semibold text-xl mb-2">Privacy Preservation</h3>
                <p className="text-gray-400">Keep sensitive data under your control while still benefiting from AI capabilities.</p>
              </motion.div>
              
              <motion.div 
                className="bg-[#1E1E1E] rounded-xl p-6 shadow-xl border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Lock className="h-10 w-10 text-[#31E1F7] mb-4" />
                <h3 className="font-semibold text-xl mb-2">Enhanced Security</h3>
                <p className="text-gray-400">Military-grade encryption ensures your data remains protected at all times.</p>
              </motion.div>
              
              <motion.div 
                className="bg-[#1E1E1E] rounded-xl p-6 shadow-xl border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Code className="h-10 w-10 text-[#7B4DFF] mb-4" />
                <h3 className="font-semibold text-xl mb-2">Seamless Integration</h3>
                <p className="text-gray-400">Works with popular AI models including Gemini, with minimal setup required.</p>
              </motion.div>
              
              <motion.div 
                className="bg-[#1E1E1E] rounded-xl p-6 shadow-xl border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#00FFCA] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="font-semibold text-xl mb-2">Regulatory Compliance</h3>
                <p className="text-gray-400">Stay compliant with GDPR, CCPA, HIPAA, and other data protection regulations.</p>
              </motion.div>
            </div>
            
            <div className="mt-16 text-center">
              <Link href="/demo">
                <a className="inline-flex items-center px-6 py-3 bg-[#00FFCA] text-[#050A30] font-medium rounded-lg hover:bg-opacity-80 transition-all duration-300">
                  Try Our Live Demo <ChevronRight className="ml-2 h-5 w-5" />
                </a>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
