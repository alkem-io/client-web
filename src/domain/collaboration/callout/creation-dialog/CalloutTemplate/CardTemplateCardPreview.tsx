import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Aspect, AspectTemplateFragment, VisualUriFragment } from '../../../../../core/apollo/generated/graphql-schema';
import ContributeCard from '../../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../../../core/ui/card/CardHeaderCaption';
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
  cardTemplate: AspectTemplateFragment;
  keepScroll?: boolean;
}

const CardTemplatePreviewCard: FC<CardTemplatePreviewProps> = ({ cardTemplate }) => {
  const { t } = useTranslation();
  const { defaultDescription } = cardTemplate;
  const currentDate = new Date();
  const commentsCount = 0;

  return (
    <ContributeCard>
      <CardHeader title={`${t('common.card')} ${t('common.title').toLowerCase()}`} iconComponent={AspectIcon}>
        <CardHeaderCaption noWrap>John Alkemist</CardHeaderCaption>
      </CardHeader>
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
