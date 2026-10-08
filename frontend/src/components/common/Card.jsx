import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ className, children, hover = false, ...props }) => {
  return (
    <div
      className={cn(
        "glass-card p-6 md:p-8",
        hover && "hover:-translate-y-1 hover:shadow-quantum-lg transition-all duration-300 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
