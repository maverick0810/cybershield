import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Shield, 
  Calendar, 
  Rocket, 
  CheckCircle, 
  Code, 
  Headphones 
} from "lucide-react";

export function CtaSection() {
  const features = [
    {
      icon: <Rocket className="h-6 w-6 text-[#00FFCA]" />,
      title: "Quick Setup",
      description: "Integrate with your existing systems in minutes, not days."
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-[#31E1F7]" />,
      title: "GDPR Ready",
      description: "Fully compliant with global data protection regulations."
    },
    {
      icon: <Code className="h-6 w-6 text-[#7B4DFF]" />,
      title: "API Access",
      description: "Flexible APIs for seamless integration with your apps."
    },
    {
      icon: <Headphones className="h-6 w-6 text-[#00FFCA]" />,
      title: "24/7 Support",
      description: "Expert assistance whenever you need it."
    }
  ];

  return (
    <section className="py-16 gradient-bg relative overflow-hidden">
      <div className="data-grid absolute inset-0 opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="bg-[#1E1E1E] bg-opacity-80 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-2xl border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-bold text-3xl md:text-4xl mb-4">Ready to <span className="text-[#00FFCA]">Secure Your Data?</span></h2>
              <p className="text-gray-300 mb-6">Join our platform and experience the next generation of AI security. Protect your users' personal information while leveraging the power of modern language models.</p>
              <div className="flex flex-wrap gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/auth">
                    <a className="px-6 py-3 bg-[#00FFCA] text-[#050A30] font-medium rounded-lg hover:bg-opacity-80 transition-all duration-300 flex items-center">
                      <Shield className="h-5 w-5 mr-2" /> Get Started Free
                    </a>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a href="#" className="px-6 py-3 bg-transparent border border-[#00FFCA] text-[#00FFCA] font-medium rounded-lg hover:bg-[#00FFCA] hover:bg-opacity-10 transition-all duration-300 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" /> Schedule Demo
                  </a>
                </motion.div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="bg-[#121212] p-4 rounded-lg shadow-lg border border-gray-700"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="text-2xl mb-2">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
