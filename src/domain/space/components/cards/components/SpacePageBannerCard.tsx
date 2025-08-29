import SpaceAvatar from '@/domain/space/components/SpaceAvatar';
import { Visual } from '@/domain/common/visual/Visual';
import { PageBannerCardWrapperProps } from '@/core/ui/layout/pageBannerCard/PageBannerCardWrapper';
import PageBannerCardWithVisual from './PageBannerCardWithVisual';

export interface SpacePageBannerCardProps extends PageBannerCardWrapperProps {
  displayName: string;
  tagline: string;
  avatar: Visual | undefined;
  tags: string[] | undefined;
  spaceId?: string;
}

const SpacePageBannerCard = ({ displayName, tagline, avatar, spaceId, ...props }: SpacePageBannerCardProps) => (
  <PageBannerCardWithVisual
    visual={<SpaceAvatar src={avatar?.uri} spaceId={spaceId} alt={displayName} />}
    title={displayName}
    subtitle={tagline}
    {...props}
  />
);

export default SpacePageBannerCard;
