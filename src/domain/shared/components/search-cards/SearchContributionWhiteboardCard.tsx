import React, { FC, ReactNode } from 'react';
import SearchBaseContributionCard, { SearchBaseContributionCardProps } from './base/SearchBaseContributionCard';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import CardFooterDate from '@/core/ui/card/CardFooterDate';
import CardFooter from '@/core/ui/card/CardFooter';
import { VisualModel } from '@/domain/common/visual/model/VisualModel';
import CardImage from '@/core/ui/card/CardImage';
import {
  WHITEBOARD_IMAGE_ASPECT_RATIO,
  WhiteboardDefaultImage,
} from '@/domain/collaboration/calloutContributions/whiteboard/WhiteboardCard';
import { useTranslation } from 'react-i18next';

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
