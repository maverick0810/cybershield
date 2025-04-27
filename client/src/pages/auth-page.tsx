import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Lock, Database } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div 
              className="bg-[#1E1E1E] rounded-xl p-8 shadow-xl border border-gray-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-bold text-2xl md:text-3xl mb-6 text-center">
                {activeTab === "login" ? "Welcome Back" : "Create Your Account"}
              </h2>
              
              <Tabs 
                defaultValue="login" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-8">
                  <TabsTrigger value="login" className="data-[state=active]:bg-[#00FFCA] data-[state=active]:text-[#050A30]">Login</TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-[#00FFCA] data-[state=active]:text-[#050A30]">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                
                <TabsContent value="register">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </motion.div>
            
            <motion.div 
              className="text-center md:text-left"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="font-bold text-3xl md:text-4xl mb-6">
                Secure Your <span className="text-[#00FFCA]">AI Interactions</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Join CyberShield AI to protect your personal information while using advanced AI systems. Our platform ensures your sensitive data never leaves your control.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-[#00FFCA] bg-opacity-20 flex items-center justify-center mr-4">
                    <Shield className="h-6 w-6 text-[#00FFCA]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-xl mb-1">Advanced PII Protection</h3>
                    <p className="text-gray-400">Our system automatically identifies and secures personal identifiable information in your AI conversations.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-[#31E1F7] bg-opacity-20 flex items-center justify-center mr-4">
                    <Lock className="h-6 w-6 text-[#31E1F7]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-xl mb-1">End-to-End Encryption</h3>
                    <p className="text-gray-400">All your sensitive data is encrypted and securely stored, never exposed to third-party services.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-[#7B4DFF] bg-opacity-20 flex items-center justify-center mr-4">
                    <Database className="h-6 w-6 text-[#7B4DFF]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-xl mb-1">Controlled Data Access</h3>
                    <p className="text-gray-400">You maintain complete control over who can access your information and when it can be used.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
