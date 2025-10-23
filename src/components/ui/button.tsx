import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded transition focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants: Record<string, string> = {
      default: 'bg-purple-600 text-white hover:bg-purple-700',
      outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-900',
    };
    const sizes: Record<string, string> = {
      default: 'h-10 px-4',
      sm: 'h-8 px-3 text-sm',
      lg: 'h-12 px-6 text-lg',
      icon: 'h-10 w-10 p-0',
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
