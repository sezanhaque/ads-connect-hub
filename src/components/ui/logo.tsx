import React from 'react';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';
interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
const Logo: React.FC<LogoProps> = ({
  className,
  showText = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-32',
    md: 'h-40',
    lg: 'h-48'
  };
  return <div className={cn("flex items-center gap-3", className)}>
      <img src={logo} alt="20/20 Solutions" className={cn(sizeClasses[size], "object-contain")} />
      {showText && <span className="font-now font-bold text-lg text-sidebar-foreground">
    </span>}
    </div>;
};
export default Logo;