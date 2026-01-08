import { useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  decimals?: number;
}

/**
 * AnimatedNumber Component
 * Animates numbers from 0 to target value when in view
 */
export default function AnimatedNumber({ 
  value, 
  duration = 1.5, 
  className = '',
  decimals = 0 
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  const spring = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });
  
  const display = useTransform(spring, (current) => {
    if (decimals === 0) {
      return Math.floor(current).toString();
    }
    return current.toFixed(decimals);
  });

  useEffect(() => {
    if (isInView && !isNaN(value) && isFinite(value)) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
