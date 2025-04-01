import SpaceAvatar from '@/domain/space/components/SpaceAvatar';
import { Visual } from '@/domain/common/visual/Visual';
import { PageBannerCardWrapperProps } from '@/core/ui/layout/pageBannerCard/PageBannerCardWrapper';
import PageBannerCardWithVisual from './PageBannerCardWithVisual';

export interface JourneyPageBannerCardProps extends PageBannerCardWrapperProps {
  displayName: string;
  tagline: string;
  avatar: Visual | undefined;
  tags: string[] | undefined;
}

const JourneyPageBannerCard = ({ displayName, tagline, avatar, ...props }: JourneyPageBannerCardProps) => (
  <PageBannerCardWithVisual
    visual={<SpaceAvatar src={avatar?.uri} />}
    title={displayName}
    subtitle={tagline}
    {...props}
  />
);

export default JourneyPageBannerCard;
