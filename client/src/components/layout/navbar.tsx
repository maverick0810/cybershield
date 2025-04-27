import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { 
  Shield, 
  Menu, 
  X, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => location === path;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#121212] bg-opacity-80 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <motion.div 
                  className="w-8 h-8 rounded-md bg-[#00FFCA] flex items-center justify-center mr-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Shield className="h-5 w-5 text-[#050A30]" />
                </motion.div>
                <span className="font-bold text-xl text-white">CyberShield<span className="text-[#00FFCA]">AI</span></span>
              </a>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features">
              <a className={`text-${isActive('/features') ? '[#00FFCA]' : 'gray-300'} hover:text-[#00FFCA] transition-colors duration-300`}>
                Features
              </a>
            </Link>
            <Link href="/how-it-works">
              <a className={`text-${isActive('/how-it-works') ? '[#00FFCA]' : 'gray-300'} hover:text-[#00FFCA] transition-colors duration-300`}>
                How It Works
              </a>
            </Link>
            <Link href="/demo">
              <a className={`text-${isActive('/demo') ? '[#00FFCA]' : 'gray-300'} hover:text-[#00FFCA] transition-colors duration-300`}>
                Demo
              </a>
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-300">
                  {user.username}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout} 
                  className="text-gray-300 hover:text-[#00FFCA]"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth">
                  <a className={`text-${isActive('/auth') ? '[#00FFCA]' : 'gray-300'} hover:text-[#00FFCA] transition-colors duration-300`}>
                    Login
                  </a>
                </Link>
                <Link href="/auth">
                  <a className="px-4 py-2 rounded-md bg-[#00FFCA] text-[#050A30] font-medium hover:bg-opacity-80 transition-all duration-300">
                    Sign Up
                  </a>
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-[#00FFCA]"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-[#1E1E1E] bg-opacity-95 backdrop-blur-md"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/features">
                <a className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-[#00FFCA]" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </a>
              </Link>
              <Link href="/how-it-works">
                <a className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-[#00FFCA]" onClick={() => setMobileMenuOpen(false)}>
                  How It Works
                </a>
              </Link>
              <Link href="/demo">
                <a className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-[#00FFCA]" onClick={() => setMobileMenuOpen(false)}>
                  Demo
                </a>
              </Link>
              
              {user ? (
                <>
                  <div className="block px-3 py-2 text-base font-medium text-gray-300">
                    Logged in as: {user.username}
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-[#00FFCA]"
                    disabled={logoutMutation.isPending}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <a className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-[#00FFCA]" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </a>
                  </Link>
                  <Link href="/auth">
                    <a className="block px-3 py-2 text-base font-medium text-[#00FFCA] hover:bg-[#1A1A40] rounded-md" onClick={() => setMobileMenuOpen(false)}>
                      Sign Up
                    </a>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
