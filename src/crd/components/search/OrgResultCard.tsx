import { Building2 } from 'lucide-react';
import { cn } from '@/crd/lib/utils';

export type OrgResultCardData = {
  id: string;
  name: string;
  logoUrl?: string;
  type: string;
  tagline?: string;
  href: string;
};

type OrgResultCardProps = {
  org: OrgResultCardData;
  onClick: () => void;
};

export function OrgResultCard({ org, onClick }: OrgResultCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={org.name}
      className={cn(
        'group block w-full rounded-xl border bg-card overflow-hidden',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'shadow-none hover:shadow-[var(--elevation-sm)] hover:border-primary/30',
        'transition-all duration-300 cursor-pointer'
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
        <h4 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
          {org.name}
        </h4>

        {/* Type badge */}
        <span className="mt-1 text-[10px] font-medium px-2 py-px rounded-full bg-secondary text-secondary-foreground">
          {org.type}
        </span>

        {/* Tagline */}
        {org.tagline && <p className="mt-2 line-clamp-2 text-[12px] text-muted-foreground w-full">{org.tagline}</p>}
      </div>
    </button>
  );
}
