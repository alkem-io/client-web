import { useTranslation } from 'react-i18next';
import { Box, Tooltip } from '@mui/material';
import { HowToRegOutlined } from '@mui/icons-material';
import { Caption } from '@/core/ui/typography';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

const DashboardMemberIcon = ({ level }: { level: SpaceLevel }) => {
  const { t } = useTranslation();

  const translatedJourneyTypeName = t(`common.space-level.${level}` as const);

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
