import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { StatsSection } from "@/components/home/stats-section";
import { CtaSection } from "@/components/cta/cta-section";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StatsSection />
          
          <motion.div 
            className="text-center my-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="font-bold text-3xl md:text-4xl mb-6">Explore Our <span className="text-[#00FFCA]">Platform</span></h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-10">
              Discover how CyberShield AI can help protect your sensitive data while leveraging the power of modern AI.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link href="/features">
                <a>
                  <motion.div 
                    className="p-8 rounded-xl bg-[#1E1E1E] border border-gray-800 hover:border-[#00FFCA] transition-all duration-300"
                    whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                  >
                    <div className="w-14 h-14 rounded-lg bg-[#00FFCA] bg-opacity-20 mx-auto flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#00FFCA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Features</h3>
                    <p className="text-gray-400">Explore our comprehensive security features designed to protect your data.</p>
                  </motion.div>
                </a>
              </Link>
              
              <Link href="/how-it-works">
                <a>
                  <motion.div 
                    className="p-8 rounded-xl bg-[#1E1E1E] border border-gray-800 hover:border-[#31E1F7] transition-all duration-300"
                    whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                  >
                    <div className="w-14 h-14 rounded-lg bg-[#31E1F7] bg-opacity-20 mx-auto flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#31E1F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">How It Works</h3>
                    <p className="text-gray-400">Learn about the technology behind our PII protection system.</p>
                  </motion.div>
                </a>
              </Link>
              
              <Link href="/demo">
                <a>
                  <motion.div 
                    className="p-8 rounded-xl bg-[#1E1E1E] border border-gray-800 hover:border-[#7B4DFF] transition-all duration-300"
                    whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                  >
                    <div className="w-14 h-14 rounded-lg bg-[#7B4DFF] bg-opacity-20 mx-auto flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#7B4DFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Live Demo</h3>
                    <p className="text-gray-400">See our system in action with an interactive demonstration.</p>
                  </motion.div>
                </a>
              </Link>
            </div>
          </motion.div>
        </div>
        
        <CtaSection />
      </main>
      
      <Footer />
    </div>
  );
}
