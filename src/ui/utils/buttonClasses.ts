export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'whatsapp' | 'danger' | 'neutral';
export type ButtonSize = 'sm' | 'md' | 'lg';

export const getButtonClasses = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  fullWidth: boolean = false,
  customClass: string = ''
): string => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-r from-gold to-gold-dark text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:ring-gold',
    secondary: 'bg-cream-200 text-gold-dark hover:bg-gold-light/20 focus:ring-cream-300',
    outline: 'border-2 border-gold text-gold-dark hover:bg-gold hover:text-white focus:ring-gold',
    whatsapp: 'bg-[#25D366] text-white shadow-md hover:bg-[#128C7E] hover:shadow-lg hover:-translate-y-0.5 focus:ring-[#25D366]',
    danger: 'border-2 border-red-500 text-red-500 bg-transparent hover:bg-red-50 focus:ring-red-500',
    neutral: 'border-2 border-brand-border bg-white text-brand-muted hover:bg-cream-200 focus:ring-brand-border'
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  
  return `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${customClass}`.trim();
};