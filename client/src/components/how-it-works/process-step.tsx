import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ProcessStepProps {
  align: "left" | "right";
  index: number;
  title: string;
  description: string;
  codeExample: string;
  icon: ReactNode;
  hexagonColor: string;
}

export function ProcessStep({
  align,
  index,
  title,
  description,
  codeExample,
  icon,
  hexagonColor
}: ProcessStepProps) {
  return (
    <div className="relative">
      <div className="md:flex items-center">
        {align === "left" ? (
          <>
            <motion.div 
              className="md:w-1/2 md:pr-8 mb-8 md:mb-0 text-right"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-2xl mb-3">{title}</h3>
              <p className="text-gray-300">{description}</p>
            </motion.div>
            
            <motion.div 
              className={`mx-auto md:mx-0 w-12 h-12 hexagon ${hexagonColor} flex items-center justify-center relative z-10 mb-8 md:mb-0`}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {icon}
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 md:pl-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-700 shadow-lg overflow-hidden">
                <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                  {codeExample}
                </pre>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div 
              className="md:w-1/2 md:pr-8 mb-8 md:mb-0 text-right order-1 md:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-700 shadow-lg overflow-hidden">
                <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                  {codeExample}
                </pre>
              </div>
            </motion.div>
            
            <motion.div 
              className={`mx-auto md:mx-0 w-12 h-12 hexagon ${hexagonColor} flex items-center justify-center relative z-10 mb-8 md:mb-0 order-0 md:order-2`}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {icon}
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 md:pl-8 order-2 md:order-3"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-2xl mb-3">{title}</h3>
              <p className="text-gray-300">{description}</p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
