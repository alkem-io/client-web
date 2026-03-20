import { HowToRegOutlined } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { Caption } from '@/core/ui/typography';

const DashboardMemberIcon = ({ level }: { level: SpaceLevel }) => {
  const { t } = useTranslation();

  const translatedSpaceLevel = t(`common.space-level.${level}` as const);

  return (
    <Tooltip
      arrow={true}
      title={<Caption>{t('pages.generic.sections.dashboard.memberOf', { entity: translatedSpaceLevel })}</Caption>}
      placement="left"
    >
      <Box paddingLeft={0.5} paddingBottom={1} sx={{ float: 'right' }}>
        <HowToRegOutlined />
      </Box>
    </Tooltip>
  );
};

export default DashboardMemberIcon;
