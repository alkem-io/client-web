import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import { AspectIcon } from '../../../../collaboration/aspect/icon/AspectIcon';
import { InnovationPackIcon } from '../InnovationPacks/InnovationPackIcon';
import { TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';
import ContributeCard from '../../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../../../core/ui/card/CardHeaderCaption';
import CardDetails from '../../../../../core/ui/card/CardDetails';
import CardDescription from '../../../../../core/ui/card/CardDescription';
import CardTags from '../../../../../core/ui/card/CardTags';
import CardSegmentCaption from '../../../../../core/ui/card/CardSegmentCaption';
import { Caption } from '../../../../../core/ui/typography';

interface AspectImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateInnovationPackMetaInfo> {}

const AspectImportTemplateCard = ({ template, onClick }: AspectImportTemplateCardProps) => {
  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template.profile.displayName} iconComponent={AspectIcon}>
        <CardHeaderCaption noWrap logoUrl={template.provider?.profile.visual?.uri}>
          {template.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescription>{template.profile.description ?? ''}</CardDescription>
        <CardTags tags={template.profile.tagset?.tags ?? []} paddingX={1.5} marginY={1} />
      </CardDetails>
      <CardSegmentCaption icon={<InnovationPackIcon />}>
        <Caption noWrap>{template.innovationPackProfile.displayName}</Caption>
      </CardSegmentCaption>
    </ContributeCard>
  );
};

export default AspectImportTemplateCard;
