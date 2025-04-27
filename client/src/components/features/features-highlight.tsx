import { motion } from "framer-motion";
import { 
  Shield, 
  Database, 
  Bot, 
  User, 
  CreditCard, 
  Mail, 
  Phone, 
  Home, 
  Calendar, 
  Hash
} from "lucide-react";

export function FeaturesHighlight() {
  const steps = [
    {
      number: "1",
      title: "Data Input Analysis",
      description: "Real-time scanning of all user inputs for sensitive information."
    },
    {
      number: "2",
      title: "PII Extraction & Storage",
      description: "Identified PII is removed and securely stored with encryption."
    },
    {
      number: "3",
      title: "Sanitized AI Processing",
      description: "Cleaned data is sent to the AI model for safe processing."
    },
    {
      number: "4",
      title: "Secure Response Handling",
      description: "AI responses are verified for security before delivery to user."
    }
  ];

  return (
    <div className="mt-20 bg-[#1E1E1E] rounded-xl overflow-hidden shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <motion.div 
          className="p-8 md:p-12 flex flex-col justify-center"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="font-semibold text-2xl md:text-3xl mb-4">Advanced <span className="text-[#00FFCA]">Protection Flow</span></h3>
          <p className="text-gray-300 mb-6">Our system creates a secure barrier between your data and AI models, ensuring that sensitive information never leaves your control.</p>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                className="flex items-start"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`flex-shrink-0 h-6 w-6 rounded-full bg-${index % 2 === 0 ? '[#00FFCA]' : '[#31E1F7]'} flex items-center justify-center text-[#050A30] font-bold mr-3`}>
                  {step.number}
                </div>
                <div>
                  <h4 className="font-medium text-white">{step.title}</h4>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80" 
            alt="Data protection visualization" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E1E1E] to-transparent"></div>
          
          {/* Animated elements overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="w-48 h-48 border-2 border-[#00FFCA] rounded-full opacity-30"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div 
              className="absolute w-36 h-36 border-2 border-[#31E1F7] rounded-full opacity-40"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div 
              className="absolute w-24 h-24 border-2 border-[#7B4DFF] rounded-full opacity-50"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
            <motion.div 
              className="absolute w-12 h-12 bg-[#00FFCA] rounded-full opacity-60"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
