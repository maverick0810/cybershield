import { motion } from "framer-motion";
import { Link } from "wouter";
import { DataParticle } from "@/components/ui/data-particle";
import { Play, InfoIcon, Shield, Lock, Fingerprint } from "lucide-react";

export function HeroSection() {
  return (
    <section className="gradient-bg clip-path-hero pt-24 md:pt-32 pb-32 relative overflow-hidden">
      <div className="data-grid absolute inset-0 opacity-20"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div 
            className="space-y-6 md:pr-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
              <span className="block">Protect Your Data with</span>
              <span className="text-[#00FFCA] glow-effect">AI-Powered Security</span>
            </h1>
            <p className="text-lg text-gray-300">
              Our LLM model secures your personal information by detecting and protecting sensitive data before it reaches AI systems.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/demo">
                  <a className="px-6 py-3 bg-[#00FFCA] text-[#050A30] font-medium rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center">
                    <Play className="h-4 w-4 mr-2" /> Try Demo
                  </a>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/how-it-works">
                  <a className="px-6 py-3 bg-transparent border border-[#00FFCA] text-[#00FFCA] font-medium rounded-lg hover:bg-[#00FFCA] hover:bg-opacity-10 transition-all duration-300 flex items-center">
                    <InfoIcon className="h-4 w-4 mr-2" /> Learn More
                  </a>
                </Link>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-full h-64 md:h-96 relative">
              <div className="absolute inset-0 bg-[#2D2D2D] rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="AI cybersecurity visualization" 
                  className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#050A30] via-transparent to-[#31E1F7] opacity-70"></div>
                
                <DataParticle containerClassName="absolute inset-0" count={25} />
                
                {/* Floating UI elements */}
                <motion.div 
                  className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 bg-[#1E1E1E] bg-opacity-80 rounded-lg p-3 shadow-lg border border-[#31E1F7]"
                  animate={{ y: [0, -20, 0] }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Shield className="text-[#00FFCA] h-5 w-5" />
                </motion.div>
                
                <motion.div 
                  className="absolute bottom-1/3 right-1/4 transform translate-x-1/2 translate-y-1/2 bg-[#1E1E1E] bg-opacity-80 rounded-lg p-3 shadow-lg border border-[#7B4DFF]"
                  animate={{ y: [0, -20, 0] }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  <Lock className="text-[#7B4DFF] h-5 w-5" />
                </motion.div>
                
                <motion.div 
                  className="absolute top-1/2 right-1/3 transform translate-x-1/2 -translate-y-1/2 bg-[#1E1E1E] bg-opacity-80 rounded-lg p-3 shadow-lg border border-[#00FFCA]"
                  animate={{ y: [0, -20, 0] }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                >
                  <Fingerprint className="text-[#31E1F7] h-5 w-5" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
