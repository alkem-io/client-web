import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CardFooter from '@/core/ui/card/CardFooter';
import CardFooterDate from '@/core/ui/card/CardFooterDate';
import CardImage from '@/core/ui/card/CardImage';
import {
  WHITEBOARD_IMAGE_ASPECT_RATIO,
  WhiteboardDefaultImage,
} from '@/domain/collaboration/calloutContributions/whiteboard/WhiteboardCard';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import type { VisualModel } from '@/domain/common/visual/model/VisualModel';
import SearchBaseContributionCard, { type SearchBaseContributionCardProps } from './base/SearchBaseContributionCard';

export type SearchContributionWhiteboardCardProps = Omit<SearchBaseContributionCardProps, 'icon'> & {
  createdDate?: Date;
  visual?: VisualModel;
  parentSegment: ReactNode;
};

export const SearchContributionWhiteboardCard: FC<SearchContributionWhiteboardCardProps> = ({
  createdDate,
  visual,
  parentSegment,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <SearchBaseContributionCard icon={WhiteboardIcon} {...props}>
      {visual?.uri ? (
        <CardImage
          aspectRatio={WHITEBOARD_IMAGE_ASPECT_RATIO}
          src={visual?.uri}
          alt={t('visuals-alt-text.banner.whiteboard.text', { displayName: props.name })}
        />
      ) : (
        <WhiteboardDefaultImage />
      )}
      {parentSegment}
      <CardFooter>{createdDate && <CardFooterDate date={createdDate} />}</CardFooter>
    </SearchBaseContributionCard>
  );
};
