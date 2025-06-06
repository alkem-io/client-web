import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { BlockSectionTitle } from '@/core/ui/typography';
import { Box } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

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
        <Trans
          i18nKey={`pages.visualEdit.${visualTypeName}.description1` as const}
          values={{ width: visual?.maxWidth, height: visual?.maxHeight }}
          components={{
            br: <br />,
            em: <em />,
            b: <strong />,
          }}
        />
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
