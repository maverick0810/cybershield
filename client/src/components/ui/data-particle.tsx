import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DataParticleProps {
  containerClassName?: string;
  count?: number;
}

export function DataParticle({ containerClassName = "", count = 20 }: DataParticleProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Random start position (0-100%)
      y: Math.random() * 100,
      delay: Math.random() * 2, // Random delay
      duration: 3 + Math.random() * 4, // Random duration between 3-7s
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${containerClassName}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1.5 h-1.5 bg-[#00FFCA] rounded-full opacity-70"
          initial={{ 
            left: `${particle.x}%`, 
            top: `${particle.y}%`,
            opacity: 0.4 + Math.random() * 0.6 // Random opacity between 0.4-1
          }}
          animate={{ 
            left: '100%',
            opacity: 0
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}
