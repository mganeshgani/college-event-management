import { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className,
  ...props
}: SkeletonProps) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      default:
        return 'rounded';
    }
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
              'bg-[length:200%_100%]',
              getVariantClass(),
              i === lines - 1 && 'w-3/4',
              className
            )}
            style={{
              width: width || '100%',
              height: height || '1rem',
            }}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
        'bg-[length:200%_100%]',
        getVariantClass(),
        className
      )}
      style={{
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'circular' ? '40px' : '1rem'),
      }}
      {...props}
    />
  );
};

export default Skeleton;
