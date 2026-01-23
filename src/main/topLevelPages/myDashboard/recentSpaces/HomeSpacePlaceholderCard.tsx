import { Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import GridItem from '@/core/ui/grid/GridItem';
import RouterLink from '@/core/ui/link/RouterLink';
import { Caption } from '@/core/ui/typography';
import { CARD_IMAGE_ASPECT_RATIO_DEFAULT } from '@/core/ui/card/CardImage';

interface HomeSpacePlaceholderCardProps {
  columns: number;
  settingsUrl: string;
}

const HomeSpacePlaceholderCard = ({ columns, settingsUrl }: HomeSpacePlaceholderCardProps) => {
  const { t } = useTranslation();

  return (
    <GridItem columns={columns}>
      <Paper
        component={RouterLink}
        to={settingsUrl}
        sx={{
          aspectRatio: CARD_IMAGE_ASPECT_RATIO_DEFAULT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed',
          borderColor: 'divider',
          background: 'transparent',
          boxShadow: 'none',
          textDecoration: 'none',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      >
        <Caption color="neutral.main">{t('pages.home.sections.recentSpaces.homeSpacePlaceholder.title')}</Caption>
        <Caption component="p" color="neutral.light">
          {t('pages.home.sections.recentSpaces.homeSpacePlaceholder.subtitle')}
        </Caption>
      </Paper>
    </GridItem>
  );
};

export default HomeSpacePlaceholderCard;
