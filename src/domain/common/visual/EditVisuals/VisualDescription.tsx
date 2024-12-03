import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { BlockSectionTitle } from '@/core/ui/typography';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

type VisualDescriptionProps = {
  visualTypeName: VisualType.Avatar | VisualType.Banner | VisualType.Card;
  visual:
    | {
        maxWidth: number;
        maxHeight: number;
        alternativeText?: string;
      }
    | undefined;
};

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
