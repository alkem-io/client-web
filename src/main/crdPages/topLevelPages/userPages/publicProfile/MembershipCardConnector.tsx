import { Globe, Lock } from 'lucide-react';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { Card, CardContent, CardHeader } from '@/crd/primitives/card';
import { Skeleton } from '@/crd/primitives/skeleton';
import useContributionProvider from '@/domain/community/profile/useContributionProvider/useContributionProvider';
import type { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';

export type MembershipCardConnectorProps = {
  contribution: SpaceHostedItem;
};

/**
 * Integration-layer connector: lazily fetches one membership's space details
 * (via the existing MUI hook) and renders a CRD-styled space card. The card
 * matches the prototype's `SpaceGridCard` look and produces a single tile in
 * the User-profile right column.
 */
export function MembershipCardConnector({ contribution }: MembershipCardConnectorProps) {
  const { details, loading } = useContributionProvider({ spaceHostedItem: contribution });

  if (loading || !details) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  const profile = details.about.profile;
  const isPrivate = !details.about.isContentPublic;
  const banner = profile.cardBanner?.uri
    ? { backgroundImage: `url(${profile.cardBanner.uri})` }
    : backgroundGradient(pickColorFromId(contribution.id));

  return (
    <a href={profile.url} className="block h-full" aria-label={profile.displayName}>
      <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer h-full flex flex-col gap-0">
        <div className="relative h-32 w-full bg-muted overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={banner}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <div className="h-6 w-6 rounded-full bg-background/90 backdrop-blur flex items-center justify-center text-muted-foreground shadow-sm">
              {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            </div>
          </div>
        </div>
        <CardHeader className="p-4 pb-2">
          <h3 className="text-card-title group-hover:text-primary transition-colors line-clamp-1">
            {profile.displayName}
          </h3>
        </CardHeader>
        {profile.tagline ? (
          <CardContent className="p-4 pt-0 flex-1">
            <p className="text-body text-muted-foreground line-clamp-2">{profile.tagline}</p>
          </CardContent>
        ) : null}
      </Card>
    </a>
  );
}
