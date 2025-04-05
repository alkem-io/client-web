import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CardContent, Skeleton } from '@mui/material';
import { CalloutType } from '@/core/apollo/generated/graphql-schema';
import ContributeCard from '@/core/ui/card/ContributeCard';
import CardHeader from '@/core/ui/card/CardHeader';
import CardHeaderCaption from '@/core/ui/card/CardHeaderCaption';
import CardDetails from '@/core/ui/card/CardDetails';
import CardDescription, { DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS } from '@/core/ui/card/CardDescription';
import { Caption } from '@/core/ui/typography';
import CardSegmentCaption from '@/core/ui/card/CardSegmentCaption';
import InnovationPackIcon from '@/domain/InnovationPack/InnovationPackIcon';
import CardTags from '@/core/ui/card/CardTags';
import calloutIcons from '@/domain/collaboration/callout/utils/calloutIcons';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import { CalloutIcon } from '@/domain/collaboration/_deprecated/CalloutIcon';
import { gutters } from '@/core/ui/grid/utils';
import { CalloutTemplate } from '@/domain/templates/models/CalloutTemplate';
import { TemplateCardProps } from './TemplateCard';

interface CalloutTemplateCardProps extends TemplateCardProps {
  template: CalloutTemplate;
}

const CalloutTemplateCard: FC<CalloutTemplateCardProps> = ({ template, innovationPack, loading, ...props }) => {
  const { t } = useTranslation();

  const hasTags = (template?.profile.defaultTagset?.tags ?? []).length > 0;
  const footerHeight = template?.callout?.type === CalloutType.LinkCollection ? (hasTags ? 3 : 1) : hasTags ? 2 : 0;
  const descriptionHeightGutters = DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS - footerHeight;

  const Icon = template?.callout?.type && calloutIcons[template.callout.type];

  return (
    <ContributeCard {...props}>
      <CardHeader title={template?.profile.displayName} iconComponent={CalloutIcon}>
        {loading && <Skeleton />}
        <CardHeaderCaption logoUrl={innovationPack?.provider?.profile.avatar?.uri}>
          {innovationPack?.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescription heightGutters={descriptionHeightGutters}>{template?.profile.description}</CardDescription>
      </CardDetails>
      <CardDetails>
        <CardContent sx={{ '&:last-child': { paddingBottom: gutters(0.2) } }}>
          {template && (
            <Box display="flex" alignItems="center" marginLeft={-0.5} gap={gutters(0.5)}>
              {Icon && <RoundedIcon marginLeft={0.5} size="xsmall" component={Icon} flexShrink={0} />}
              {template.callout?.type && (
                <Caption>{t(`components.calloutTypeSelect.label.${template.callout.type}` as const)}</Caption>
              )}
            </Box>
          )}
        </CardContent>
      </CardDetails>
      <CardDetails>
        <CardTags tags={template?.profile.defaultTagset?.tags ?? []} marginY={1} hideIfEmpty />
      </CardDetails>
      {innovationPack?.profile.displayName && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{innovationPack?.profile.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default CalloutTemplateCard;
