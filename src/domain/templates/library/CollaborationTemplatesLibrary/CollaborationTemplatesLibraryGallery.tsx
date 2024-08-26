import React, { ComponentType, FC } from 'react';
import { Box, BoxProps, Skeleton } from '@mui/material';
import { TemplateBase, TemplateCardBaseProps } from './TemplateBase';
import { useTranslation } from 'react-i18next';
import { times } from 'lodash';
import { Identifiable } from '../../../../core/utils/Identifiable';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import { Caption } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';

const GallerySkeleton: FC<BoxProps> = props => {
  return (
    <Box display="flex" gap={2} height={gutters(8)} {...props}>
      {times(4, i => (
        <Skeleton key={i} sx={{ flexGrow: 1 }} />
      ))}
    </Box>
  );
};

export interface CollaborationTemplatesLibraryGalleryProps<Template extends TemplateBase> {
  templates: (Template & Identifiable)[] | undefined;
  templateCardComponent: ComponentType<TemplateCardBaseProps<Template>>;
  onPreviewTemplate: (template: Template & Identifiable) => void;
  loading?: boolean;
}

const CollaborationTemplatesLibraryGallery = <Template extends TemplateBase>({
  templates,
  templateCardComponent: TemplateCard,
  onPreviewTemplate,
  loading,
}: CollaborationTemplatesLibraryGalleryProps<Template>) => {
  const { t } = useTranslation();

  return (
    <GridProvider columns={12}>
      {(loading || !templates) && <GallerySkeleton />}
      {!loading && templates && templates.length > 0 && (
        <ScrollableCardsLayoutContainer>
          {templates.map(template => (
            <TemplateCard key={template.id} template={template} onClick={() => onPreviewTemplate(template)} />
          ))}
        </ScrollableCardsLayoutContainer>
      )}
      {!loading && templates && templates.length === 0 && (
        <Caption>{t('pages.admin.generic.sections.templates.import.no-templates')}</Caption>
      )}
    </GridProvider>
  );
};

export default CollaborationTemplatesLibraryGallery;
