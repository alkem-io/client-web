import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

type LeadBlockProps = {
  name: string;
  avatarUrl?: string;
  initials: string;
  location?: string;
  bio?: string;
  href?: string;
  className?: string;
};

export function LeadBlock({ name, avatarUrl, initials, location, bio, href, className }: LeadBlockProps) {
  const { t } = useTranslation('crd-space');

  const content = (
    <div className={cn('bg-card border border-border rounded-lg p-4', className)}>
      <p className="uppercase tracking-wider text-[11px] font-semibold text-muted-foreground mb-3">
        {t('sidebar.spaceLead')}
      </p>
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 border-2 border-border">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback
            style={{
              background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
            }}
            className="text-[10px] font-bold text-primary"
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          {location && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" aria-hidden="true" />
              {location}
            </p>
          )}
        </div>
      </div>
      {bio && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{bio}</p>}
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}
