import { useTranslation } from 'react-i18next';
import { Box, Tooltip } from '@mui/material';
import { HowToRegOutlined } from '@mui/icons-material';
import { Caption } from '@/core/ui/typography';

const DashboardMemberIcon = () => {
  const { t } = useTranslation();

  // TODO: remove this + review the usage in the translation file below
  const journeyTypeName = 'space';
  const translatedJourneyTypeName = t(`common.${journeyTypeName}` as const);

  return (
    <Tooltip
      arrow
      title={<Caption>{t('pages.generic.sections.dashboard.memberOf', { entity: translatedJourneyTypeName })}</Caption>}
      placement="left"
    >
      <Box paddingLeft={0.5} paddingBottom={1} sx={{ float: 'right' }}>
        <HowToRegOutlined />
      </Box>
    </Tooltip>
  );
};

export default DashboardMemberIcon;
