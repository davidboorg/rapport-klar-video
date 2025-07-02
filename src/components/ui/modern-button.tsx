
import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';

interface ModernButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'glass' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
      secondary: 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white',
      glass: 'bg-white/10 backdrop-blur hover:bg-white/20 text-white border border-white/20',
      outline: 'border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-12 px-8 text-lg',
      xl: 'h-14 px-10 text-xl',
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

ModernButton.displayName = 'ModernButton';
