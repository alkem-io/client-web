import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { cn } from '@/crd/lib/utils';

export type InnovationHubBannerProps = {
  imageUrl?: string;
  color: string;
  alt: string;
  variant?: 'page' | 'compact';
  className?: string;
};

export const InnovationHubBanner = ({
  imageUrl,
  color,
  alt,
  variant = 'page',
  className,
}: InnovationHubBannerProps) => {
  const heightClass = variant === 'compact' ? 'h-32' : 'h-64';
  const offsetClass = variant === 'page' ? '-mt-16' : '';

  return (
    <div className={cn('relative w-full overflow-hidden', heightClass, offsetClass, className)}>
      {imageUrl ? (
        <img src={imageUrl} alt={alt} className="block h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full" style={backgroundGradient(color)} role="img" aria-label={alt} />
      )}
    </div>
  );
};
