import { Building2 } from 'lucide-react';
import { MatchedTerms } from '@/crd/components/search/MatchedTerms';
import { cn } from '@/crd/lib/utils';

export type OrgResultCardData = {
  id: string;
  name: string;
  logoUrl?: string;
  type: string;
  tagline?: string;
  matchedTerms?: string[];
  href: string;
};

type OrgResultCardProps = {
  org: OrgResultCardData;
  onClick: () => void;
};

export function OrgResultCard({ org, onClick }: OrgResultCardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-card overflow-hidden',
        'shadow-none hover:shadow-[var(--elevation-sm)] hover:border-primary/30 transition-all duration-300'
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={org.name}
        className={cn(
          'block w-full cursor-pointer text-left',
          'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl'
        )}
      >
        {/* Content */}
        <div className="p-5 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="size-14 rounded-lg bg-secondary border-2 border-border mb-3 flex items-center justify-center overflow-hidden">
            {org.logoUrl ? (
              <img src={org.logoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Building2 aria-hidden="true" className="size-6 text-muted-foreground" />
            )}
          </div>

          {/* Name */}
          <h4 className="text-card-title text-card-foreground group-hover:text-primary transition-colors duration-200">
            {org.name}
          </h4>

          {/* Type badge */}
          <span className="mt-1 text-badge px-2 py-px rounded-full bg-secondary text-secondary-foreground">
            {org.type}
          </span>

          {/* Tagline */}
          {org.tagline && <p className="mt-2 line-clamp-2 text-caption text-muted-foreground w-full">{org.tagline}</p>}
        </div>
      </button>

      {/* Matched search terms — sibling of the card button (not nested). */}
      {org.matchedTerms && org.matchedTerms.length > 0 && (
        <div className="px-5 pb-4 -mt-1">
          <MatchedTerms terms={org.matchedTerms} />
        </div>
      )}
    </div>
  );
}
