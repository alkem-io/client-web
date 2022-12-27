import React, { FC } from 'react';
import { Aspect, AspectTemplate, VisualUriFragment } from '../../../../../core/apollo/generated/graphql-schema';
import ContributeCard from '../../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../../core/ui/card/CardHeader';
import CardDetails from '../../../../../core/ui/card/CardDetails';
import CardDescription from '../../../../../core/ui/card/CardDescription';
import CardTags from '../../../../../core/ui/card/CardTags';
import CardFooter from '../../../../../core/ui/card/CardFooter';
import MessageCounter from '../../../../../core/ui/card/MessageCounter';
import CardFooterDate from '../../../../../core/ui/card/CardFooterDate';
import { AspectIcon } from '../../../aspect/icon/AspectIcon';

type NeededFields = 'id' | 'nameID' | 'displayName' | 'profile' | 'type';
export type CardTemplatePreview = Pick<Aspect, NeededFields> & { bannerNarrow?: VisualUriFragment } & {
  calloutNameId: string;
};

export interface CardTemplatePreviewProps {
  cardTemplate: AspectTemplate;
  keepScroll?: boolean;
}

const CardTemplatePreviewCard: FC<CardTemplatePreviewProps> = ({ cardTemplate }) => {
  const { defaultDescription } = cardTemplate;
  const currentDate = new Date();
  const commentsCount = 3;

  return (
    <ContributeCard>
      <CardHeader title={'Card name'} iconComponent={AspectIcon} createdBy={'John Alkemist'} />
      <CardDetails>
        <CardDescription>{defaultDescription}</CardDescription>
        <CardTags tags={[]} paddingX={1.5} marginY={1} />
      </CardDetails>
      <CardFooter>
        <CardFooterDate date={currentDate} />
        <MessageCounter commentsCount={commentsCount} />
      </CardFooter>
    </ContributeCard>
  );
};

export default CardTemplatePreviewCard;
