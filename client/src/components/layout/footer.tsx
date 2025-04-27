import { Link } from "wouter";
import { 
  Shield, 
  Twitter, 
  Linkedin, 
  Github 
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#121212] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <Link href="/">
              <a className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-md bg-[#00FFCA] flex items-center justify-center mr-2">
                  <Shield className="h-5 w-5 text-[#050A30]" />
                </div>
                <span className="font-bold text-xl text-white">CyberShield<span className="text-[#00FFCA]">AI</span></span>
              </a>
            </Link>
            <p className="text-gray-400 mb-4">Protecting personal information in the age of AI with advanced security solutions.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">API</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">Release Notes</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">Press</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">Privacy Guide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">Security Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">Compliance</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">Partners</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFCA] transition-colors">Help Center</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} CyberShield AI. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-[#00FFCA] transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-[#00FFCA] transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-[#00FFCA] transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
