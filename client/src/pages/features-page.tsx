import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { FeatureCard } from "@/components/features/feature-card";
import { FeaturesHighlight } from "@/components/features/features-highlight";
import { CtaSection } from "@/components/cta/cta-section";
import { 
  EyeOff, 
  Database, 
  Bot,
  ShieldCheck,
  ServerCrash,
  FileJson 
} from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: <EyeOff className="h-6 w-6 text-[#00FFCA]" />,
      title: "PII Detection",
      description: "Automatically identifies and flags personal information in real-time using advanced pattern recognition algorithms.",
      benefits: ["Identifies 20+ PII types", "Contextual analysis", "Low false positive rate"],
      iconBgColor: "bg-[#00FFCA]",
      checkColor: "text-[#00FFCA]"
    },
    {
      icon: <Database className="h-6 w-6 text-[#31E1F7]" />,
      title: "Secure Storage",
      description: "Safely stores sensitive information in encrypted JSON files, preventing exposure to third-party AI systems.",
      benefits: ["AES-256 encryption", "Local storage options", "Secure access controls"],
      iconBgColor: "bg-[#31E1F7]",
      checkColor: "text-[#31E1F7]"
    },
    {
      icon: <Bot className="h-6 w-6 text-[#7B4DFF]" />,
      title: "AI Integration",
      description: "Seamlessly works with modern LLM models like Gemini, ensuring security without sacrificing functionality.",
      benefits: ["Multiple API support", "Low latency processing", "Custom model training"],
      iconBgColor: "bg-[#7B4DFF]",
      checkColor: "text-[#7B4DFF]"
    }
  ];

  const advancedFeatures = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-[#00FFCA]" />,
      title: "Continuous Monitoring",
      description: "Real-time scanning of data streams for sensitive information with instant protection mechanisms.",
      benefits: ["24/7 protection", "Automatic updates", "Intrusion detection"],
      iconBgColor: "bg-[#00FFCA]",
      checkColor: "text-[#00FFCA]"
    },
    {
      icon: <ServerCrash className="h-6 w-6 text-[#31E1F7]" />,
      title: "Breach Prevention",
      description: "Proactive security measures that prevent unauthorized access to personal information.",
      benefits: ["Zero-day protection", "Honeypot technology", "Behavioral analysis"],
      iconBgColor: "bg-[#31E1F7]",
      checkColor: "text-[#31E1F7]"
    },
    {
      icon: <FileJson className="h-6 w-6 text-[#7B4DFF]" />,
      title: "Data Governance",
      description: "Comprehensive tools for managing how personal data is collected, stored, and processed.",
      benefits: ["Compliance reporting", "Retention policies", "Access logs"],
      iconBgColor: "bg-[#7B4DFF]",
      checkColor: "text-[#7B4DFF]"
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
              <h1 className="font-bold text-3xl md:text-4xl mb-4">Advanced <span className="text-[#00FFCA]">Security Features</span></h1>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">Our technology combines AI-powered detection with secure storage solutions to protect your sensitive information.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  benefits={feature.benefits}
                  iconBgColor={feature.iconBgColor}
                  checkColor={feature.checkColor}
                />
              ))}
            </div>
            
            <FeaturesHighlight />
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
              <h2 className="font-bold text-3xl md:text-4xl mb-4">Enterprise-Grade <span className="text-[#31E1F7]">Protection</span></h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">Advanced security features designed for organizations with stringent data protection requirements.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {advancedFeatures.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  benefits={feature.benefits}
                  iconBgColor={feature.iconBgColor}
                  checkColor={feature.checkColor}
                />
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-[#050A30]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <h2 className="font-bold text-3xl md:text-4xl mb-6">Comprehensive <span className="text-[#00FFCA]">Protection Matrix</span></h2>
                <p className="text-gray-300 mb-8">Our multi-layered approach ensures that your personal information is secured at every level, from input processing to storage and transmission.</p>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#00FFCA] bg-opacity-20 flex items-center justify-center mr-4">
                      <span className="text-[#00FFCA] font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">Input Analysis</h3>
                      <p className="text-gray-400">Advanced pattern matching algorithms identify sensitive data.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#31E1F7] bg-opacity-20 flex items-center justify-center mr-4">
                      <span className="text-[#31E1F7] font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">Data Isolation</h3>
                      <p className="text-gray-400">PII is separated from regular content to ensure security.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#7B4DFF] bg-opacity-20 flex items-center justify-center mr-4">
                      <span className="text-[#7B4DFF] font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">Encrypted Storage</h3>
                      <p className="text-gray-400">Military-grade encryption protects all stored information.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#00FFCA] bg-opacity-20 flex items-center justify-center mr-4">
                      <span className="text-[#00FFCA] font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">Secure Transmission</h3>
                      <p className="text-gray-400">Only sanitized data is transmitted to AI processing services.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <img 
                  src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="Cybersecurity technology" 
                  className="rounded-xl shadow-2xl"
                />
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
