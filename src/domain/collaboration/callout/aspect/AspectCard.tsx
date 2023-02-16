import React, { useCallback } from 'react';
import { Skeleton } from '@mui/material';
import { AspectIcon } from '../../aspect/icon/AspectIcon';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardDescription from '../../../../core/ui/card/CardDescription';
import CardTags from '../../../../core/ui/card/CardTags';
import CardFooter from '../../../../core/ui/card/CardFooter';
import CardFooterDate from '../../../../core/ui/card/CardFooterDate';
import MessageCounter from '../../../../core/ui/card/MessageCounter';
import { Aspect, VisualUriFragment } from '../../../../core/apollo/generated/graphql-schema';
import CardHeaderCaption from '../../../../core/ui/card/CardHeaderCaption';
import { gutters } from '../../../../core/ui/grid/utils';

type NeededFields = 'id' | 'nameID' | 'displayName' | 'profile' | 'type';

export type AspectCardAspect = Pick<Aspect, NeededFields> & {
  bannerNarrow?: VisualUriFragment;
  createdBy: { displayName: string };
  comments?: { commentsCount?: number };
  createdDate: string | Date; // Apollo says Date while actually it's a string
};

interface AspectCardProps {
  aspect: AspectCardAspect | undefined;
  onClick: (aspect: AspectCardAspect) => void;
}

const AspectCard = ({ aspect, onClick }: AspectCardProps) => {
  const handleClick = useCallback(() => aspect && onClick(aspect), [onClick, aspect]);

  if (!aspect) {
    return (
      <ContributeCard>
        <CardHeader title={<Skeleton />} iconComponent={AspectIcon}>
          <Skeleton />
        </CardHeader>
        <Skeleton sx={{ height: gutters(8), marginX: gutters() }} />
        <CardFooter>
          <Skeleton width="100%" />
        </CardFooter>
      </ContributeCard>
    );
  }

  return (
    <ContributeCard onClick={handleClick}>
      <CardHeader title={aspect.displayName} iconComponent={AspectIcon}>
        <CardHeaderCaption noWrap>{aspect.createdBy.displayName}</CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescription>{aspect.profile?.description!}</CardDescription>
        <CardTags tags={aspect.profile?.tagset?.tags ?? []} paddingX={1.5} marginY={1} />
      </CardDetails>
      <CardFooter>
        {aspect.createdDate && <CardFooterDate date={aspect.createdDate} />}
        <MessageCounter commentsCount={aspect.comments?.commentsCount} />
      </CardFooter>
    </ContributeCard>
  );
};

export default AspectCard;
