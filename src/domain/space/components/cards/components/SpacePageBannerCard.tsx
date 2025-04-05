import SpaceAvatar from '@/domain/space/components/SpaceAvatar';
import { Visual } from '@/domain/common/visual/Visual';
import { PageBannerCardWrapperProps } from '@/core/ui/layout/pageBannerCard/PageBannerCardWrapper';
import PageBannerCardWithVisual from './PageBannerCardWithVisual';

export interface SpacePageBannerCardProps extends PageBannerCardWrapperProps {
  displayName: string;
  tagline: string;
  avatar: Visual | undefined;
  tags: string[] | undefined;
}

const SpacePageBannerCard = ({ displayName, tagline, avatar, ...props }: SpacePageBannerCardProps) => (
  <PageBannerCardWithVisual
    visual={<SpaceAvatar src={avatar?.uri} />}
    title={displayName}
    subtitle={tagline}
    {...props}
  />
);

export default SpacePageBannerCard;
