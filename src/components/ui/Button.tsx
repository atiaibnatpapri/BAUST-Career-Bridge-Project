/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'teal' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14B8A6] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0';

  const sizeClasses = {
    sm: 'text-xs px-3.5 min-h-[40px] sm:min-h-[36px] py-1.5 gap-1.5',
    md: 'text-sm px-4 min-h-[44px] sm:min-h-[40px] py-2 gap-2',
    lg: 'text-sm sm:text-base px-6 min-h-[46px] py-2.5 gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#0F2A4A] hover:bg-[#1A3E68] focus:bg-[#1A3E68] active:bg-[#0A1C32] text-white hover:text-white focus:text-white active:text-white [&_svg]:text-current shadow-xs',
    secondary:
      'bg-[#2E5E3E] hover:bg-[#1E3F2A] focus:bg-[#1E3F2A] active:bg-[#1E3F2A] text-white hover:text-white focus:text-white active:text-white [&_svg]:text-current shadow-xs',
    accent:
      'bg-[#C9A227] hover:bg-[#DFB83B] focus:bg-[#DFB83B] active:bg-[#B8921F] text-[#0F2A4A] hover:text-[#0F2A4A] focus:text-[#0F2A4A] active:text-[#0F2A4A] [&_svg]:text-current shadow-xs',
    teal:
      'bg-[#14B8A6] hover:bg-[#2DD4BF] focus:bg-[#2DD4BF] active:bg-[#0D9488] text-[#0B2A3F] hover:text-[#0B2A3F] focus:text-[#0B2A4A] active:text-white [&_svg]:text-current shadow-xs',
    outline:
      'border border-slate-300 bg-white text-[#0F2A4A] hover:bg-slate-50 hover:text-[#0F2A4A] focus:bg-slate-50 focus:text-[#0F2A4A] active:bg-slate-100 active:text-[#0F2A4A] visited:text-[#0F2A4A] [&_svg]:text-current',
    ghost:
      'text-[#0F2A4A] hover:text-[#0F2A4A] focus:text-[#0F2A4A] active:text-[#0F2A4A] hover:bg-slate-100 focus:bg-slate-100 [&_svg]:text-current',
    danger:
      'bg-rose-600 hover:bg-rose-700 focus:bg-rose-700 active:bg-rose-800 text-white hover:text-white focus:text-white active:text-white [&_svg]:text-current shadow-xs',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
