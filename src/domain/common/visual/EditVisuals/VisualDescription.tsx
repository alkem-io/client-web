import { BlockSectionTitle } from '@/core/ui/typography';
import { Box } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface VisualDescriptionProps {
  visualTypeName: 'avatar' | 'banner' | 'cardBanner';
  visual:
    | {
        maxWidth: number;
        maxHeight: number;
        alternativeText?: string;
      }
    | undefined;
}

const VisualDescription = ({ visualTypeName, visual }: VisualDescriptionProps) => {
  const { t } = useTranslation();

  return (
    <Box paddingLeft={2}>
      <BlockSectionTitle>{t(`pages.visualEdit.${visualTypeName}.title` as const)}</BlockSectionTitle>
      <BlockSectionTitle>
        {t(`pages.visualEdit.${visualTypeName}.description1` as const, {
          width: visual?.maxWidth,
          height: visual?.maxHeight,
        })}
      </BlockSectionTitle>
      {visual?.alternativeText && (
        <BlockSectionTitle>
          {t(`pages.visualEdit.${visualTypeName}.description` as const, {
            alternativeText: visual?.alternativeText,
          })}
        </BlockSectionTitle>
      )}
    </Box>
  );
};

export default VisualDescription;
