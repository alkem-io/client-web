import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

export type HubSettingsHeaderThumbnailProps = {
  imageUrl?: string;
  color: string;
  initials: string;
  alt: string;
  className?: string;
};

export const HubSettingsHeaderThumbnail = ({
  imageUrl,
  color,
  initials,
  alt,
  className,
}: HubSettingsHeaderThumbnailProps) => (
  <Avatar className={cn('size-12 shrink-0 border-2 border-border', className)}>
    {imageUrl && <AvatarImage src={imageUrl} alt={alt} className="object-cover" />}
    <AvatarFallback color={color} className="text-sm font-semibold text-white">
      {initials}
    </AvatarFallback>
  </Avatar>
);
