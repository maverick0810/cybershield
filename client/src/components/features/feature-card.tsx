import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  benefits: string[];
  iconBgColor: string;
  checkColor: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  benefits,
  iconBgColor,
  checkColor
}: FeatureCardProps) {
  return (
    <motion.div 
      className="bg-[#1E1E1E] rounded-xl p-6 shadow-xl border border-gray-800 group"
      whileHover={{ 
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      transition={{ duration: 0.3 }}
    >
      <div className={`w-14 h-14 rounded-lg ${iconBgColor} bg-opacity-20 flex items-center justify-center mb-6 group-hover:bg-opacity-30 transition-all duration-300`}>
        {icon}
      </div>
      <h3 className="font-semibold text-xl mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
      <ul className="mt-4 space-y-2 text-gray-400">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center">
            <Check className={`${checkColor} mr-2 text-sm h-4 w-4`} />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
