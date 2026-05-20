import React, { forwardRef } from 'react';
import { getButtonClasses, type ButtonVariant, type ButtonSize } from '@/ui/utils/buttonClasses';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    href?: string;
  };

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  href,
  children,
  ...rest
}, ref) => {
  const combinedClasses = getButtonClasses(variant, size, fullWidth, className);
  
  if (href) {
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={combinedClasses} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} className={combinedClasses} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';