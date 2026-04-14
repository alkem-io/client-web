import { ExternalLink, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type CalloutLinkActionProps = {
  url: string;
  displayName: string;
  isExternal: boolean;
  className?: string;
};

export function CalloutLinkAction({ url, displayName, isExternal, className }: CalloutLinkActionProps) {
  const isValidUrl = url.startsWith('http://') || url.startsWith('https://');

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button variant="outline" className="gap-2" asChild={isValidUrl} disabled={!isValidUrl}>
        {isValidUrl ? (
          <a href={url} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
            {isExternal ? (
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            ) : (
              <LinkIcon className="w-4 h-4" aria-hidden="true" />
            )}
            {displayName}
          </a>
        ) : (
          <>
            <LinkIcon className="w-4 h-4" aria-hidden="true" />
            {displayName}
          </>
        )}
      </Button>
    </div>
  );
}
