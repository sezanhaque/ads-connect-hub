import React from 'react';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ 
  className, 
  showText = false, 
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  const textVariants = {
    default: 'text-primary',
    white: 'text-white',
    dark: 'text-charcoal'
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img 
        src={logo} 
        alt="20/20 Solutions" 
        className={cn(sizeClasses[size], "object-contain")}
      />
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-now font-bold text-2xl leading-none", textVariants[variant])}>
            20/20
          </span>
          <span className={cn("font-now font-medium text-sm tracking-wider", textVariants[variant])}>
            SOLUTIONS
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;