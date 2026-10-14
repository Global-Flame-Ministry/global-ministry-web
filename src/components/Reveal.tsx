import React from 'react';
import { useReveal } from '../hooks/useReveal';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
}

const Reveal: React.FC<RevealProps> = ({ children, className = '' }) => {
  const { ref, revealed } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-[400ms] ease-out motion-reduce:transition-none
        ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} ${className}`}
    >
      {children}
    </div>
  );
};

export default Reveal;
