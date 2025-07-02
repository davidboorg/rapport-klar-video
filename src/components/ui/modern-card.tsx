
import React from 'react';
import { cn } from '@/lib/utils';

interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'gradient';
  hover?: boolean;
}

export const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant = 'glass', hover = true, children, ...props }, ref) => {
    const variants = {
      glass: 'bg-white/10 backdrop-blur-xl border border-white/20',
      solid: 'bg-slate-800/90 border border-slate-700/50',
      gradient: 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl shadow-xl transition-all duration-300',
          variants[variant],
          hover && 'hover:scale-105 hover:shadow-2xl cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModernCard.displayName = 'ModernCard';

export const ModernCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 pb-3', className)}
    {...props}
  />
));

ModernCardHeader.displayName = 'ModernCardHeader';

export const ModernCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-bold leading-none tracking-tight text-white',
      className
    )}
    {...props}
  />
));

ModernCardTitle.displayName = 'ModernCardTitle';

export const ModernCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn('p-6 pt-0', className)} 
    {...props} 
  />
));

ModernCardContent.displayName = 'ModernCardContent';
