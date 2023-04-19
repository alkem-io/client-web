import React, { ComponentType, FC } from 'react';
import { Box, BoxProps, Skeleton } from '@mui/material';
import { TemplateBase, TemplateCardBaseProps } from './TemplateBase';
import { useTranslation } from 'react-i18next';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import CardsLayout from '../../../../core/ui/card/CardsLayout/CardsLayout';
import { Text } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import { times } from 'lodash';

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
  templates: Template[] | undefined;
  templateCardComponent: ComponentType<TemplateCardBaseProps<Template>>;
  onPreviewTemplate: (template: Template) => void;
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
    <GridProvider columns={12} force>
      {(loading || !templates) && <GallerySkeleton />}
      {!loading && templates && (
        <CardsLayout items={templates} deps={[templates]} disablePadding cards={false}>
          {template => (
            <TemplateCard key={template.id} template={template} onClick={() => onPreviewTemplate(template)} />
          )}
        </CardsLayout>
      )}
      {!loading && templates && templates.length === 0 && (
        <Text>{t('pages.admin.generic.sections.templates.import.no-templates')}</Text>
      )}
    </GridProvider>
  );
};

export default CollaborationTemplatesLibraryGallery;
