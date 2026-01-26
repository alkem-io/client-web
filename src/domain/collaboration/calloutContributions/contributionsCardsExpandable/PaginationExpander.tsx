import { Trans, useTranslation } from 'react-i18next';
import { Caption } from '@/core/ui/typography';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';

interface PaginationExpanderProps {
  onClick: () => void;
  totalContributions: number;
  pageSize: number;
  isCollapsed: boolean;
  hasMore: boolean;
}

/**
 * Helper component to expand/collapse the contributions of the component ContributionsCardsExpandable.
 * Shows the total number of contributions and a linkbutton to expand/collapse.
 */
const PaginationExpander = ({
  onClick,
  totalContributions,
  pageSize,
  isCollapsed,
  hasMore,
}: PaginationExpanderProps) => {
  const { t } = useTranslation();
  if (totalContributions === 0) {
    return (
      <Box>
        <Caption>{t('callout.contributions.noContributions')}</Caption>
      </Box>
    );
  }

  if (!isCollapsed) {
    return (
      <Box display="flex" flexDirection="row" alignContent="end" sx={{ cursor: 'pointer' }} onClick={onClick}>
        <ExpandLessIcon />
        <Caption>
          <Trans
            i18nKey="callout.contributions.contributionsCollapse"
            components={{
              click: <strong />,
            }}
            values={{ count: totalContributions }}
          />
        </Caption>
      </Box>
    );
  } else {
    if (!hasMore && totalContributions <= pageSize) {
      return <Caption>{t('callout.contributions.contributionsCount', { count: totalContributions })}</Caption>;
    } else {
      return (
        <Box textAlign="center" marginTop={gutters(-2)}>
          <Button
            variant="outlined"
            onClick={onClick}
            startIcon={<ExpandMoreIcon />}
            sx={{ backgroundColor: theme => theme.palette.background.paper }}
          >
            {t('buttons.expand')}
          </Button>
        </Box>
      );
    }
  }
};

export default PaginationExpander;
