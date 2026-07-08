import { Sparkles } from 'lucide-react';
import type { VirtualContributorCardItem } from '@/crd/components/common/profileTypes';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';

export type VirtualContributorCardProps = {
  vc: VirtualContributorCardItem;
};

/**
 * The Virtual Contributor card as shown on the User / Organization profile
 * "Resources Hosted" tab — extracted from the inline card in
 * `UserResourceSections` so the Innovation Hub home page renders the exact
 * same presentation (FR-005): sharing the component is what keeps "identical
 * to the User Profile card" true instead of a copy that drifts.
 */
export function VirtualContributorCard({ vc }: VirtualContributorCardProps) {
  return (
    <a
      href={vc.href}
      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Avatar className="size-9 rounded-md shrink-0">
        {vc.avatarImageUrl ? <AvatarImage src={vc.avatarImageUrl} alt="" /> : null}
        <AvatarFallback className="bg-primary/10 text-primary rounded-md">
          <Sparkles className="w-5 h-5" aria-hidden="true" />
        </AvatarFallback>
      </Avatar>
      <div>
        <h4 className="text-card-title text-foreground">{vc.displayName}</h4>
        {vc.description ? <p className="text-body text-muted-foreground mb-2">{vc.description}</p> : null}
        <Badge variant="secondary" className="text-badge h-5">
          {vc.type}
        </Badge>
      </div>
    </a>
  );
}
