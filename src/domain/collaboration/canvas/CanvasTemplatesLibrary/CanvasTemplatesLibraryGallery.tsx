import React, { FC, useMemo } from 'react';
import { Box, BoxProps, Skeleton } from '@mui/material';
import { CanvasTemplate } from './CanvasTemplate';
import CanvasTemplateCard from './CanvasTemplateCard';
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

export interface CanvasTemplatesLibraryGalleryProps {
  canvases: CanvasTemplate[] | undefined;
  filter?: string[];
  onPreviewTemplate: (template: CanvasTemplate) => void;
  loading?: boolean;
}

const CanvasTemplatesLibraryGallery = ({
  canvases,
  filter,
  onPreviewTemplate,
  loading,
}: CanvasTemplatesLibraryGalleryProps) => {
  const { t } = useTranslation();

  const templates = useMemo(() => {
    return canvases?.filter(canvas => {
      if (!filter || filter.length === 0) return true;
      const canvasString =
        `${canvas.displayName} ${canvas.provider.displayName} ${canvas.innovationPack.displayName}`.toLowerCase();
      for (const term of filter) {
        if (canvasString.includes(term.toLowerCase())) {
          return true;
        }
      }
      return false;
    });
  }, [canvases, filter]);

  return (
    <GridProvider columns={12} force>
      {(loading || !templates) && <GallerySkeleton />}
      {!loading && templates && (
        <CardsLayout items={templates} deps={[templates]} disablePadding cards={false}>
          {template => (
            <CanvasTemplateCard key={template.id} template={template} onClick={() => onPreviewTemplate(template)} />
          )}
        </CardsLayout>
      )}
      {!loading && templates && templates.length === 0 && (
        <Text>{t('pages.admin.generic.sections.templates.import.no-templates')}</Text>
      )}
    </GridProvider>
  );
};

export default CanvasTemplatesLibraryGallery;
