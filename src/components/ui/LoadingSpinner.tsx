import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-b-2 border-t-2 border-soft-red',
          'h-full w-full',
          className
        )}
        style={{
          borderColor: 'transparent',
          borderTopColor: 'currentColor',
          borderBottomColor: 'currentColor',
        }}
      ></div>
    </div>
  );
}
