import { motion } from "framer-motion";
import { 
  UserCheck, 
  Zap, 
  Database, 
  ShieldCheck 
} from "lucide-react";

const stats = [
  {
    icon: <UserCheck className="h-8 w-8 text-[#00FFCA]" />,
    value: "99.8%",
    label: "PII Detection Rate",
    color: "border-[#00FFCA]",
    iconColor: "text-[#00FFCA]"
  },
  {
    icon: <Zap className="h-8 w-8 text-[#31E1F7]" />,
    value: "50ms",
    label: "Avg. Processing Time",
    color: "border-[#31E1F7]",
    iconColor: "text-[#31E1F7]"
  },
  {
    icon: <Database className="h-8 w-8 text-[#7B4DFF]" />,
    value: "10M+",
    label: "Protected Data Points",
    color: "border-[#7B4DFF]",
    iconColor: "text-[#7B4DFF]"
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-[#00FFCA]" />,
    value: "100%",
    label: "GDPR Compliance",
    color: "border-[#00FFCA]",
    iconColor: "text-[#00FFCA]"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function StatsSection() {
  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-16"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {stats.map((stat, index) => (
        <motion.div 
          key={index} 
          className={`bg-[#1E1E1E] bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:${stat.color} transition-all duration-300 group`}
          variants={item}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className={`${stat.iconColor} text-2xl mb-2 group-hover:scale-110 transition-transform duration-300`}>
            {stat.icon}
          </div>
          <h3 className="font-semibold text-2xl">{stat.value}</h3>
          <p className="text-gray-400">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
