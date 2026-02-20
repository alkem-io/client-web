import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, ButtonBase, Typography } from '@mui/material';

const DEFAULT_COLLAPSED_HEIGHT = 250;
const COLLAPSE_THRESHOLD = 2;

interface CollapsibleCommentsThreadProps {
  children: ReactNode;
  itemCount: number;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  collapsedHeight?: number;
  id?: string;
}

const CollapsibleCommentsThread = ({
  children,
  itemCount,
  collapsed,
  onToggleCollapse,
  collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
  id,
}: CollapsibleCommentsThreadProps) => {
  const { t } = useTranslation();

  const collapsible = itemCount > COLLAPSE_THRESHOLD && Boolean(onToggleCollapse);

  return (
    <>
      <Box position="relative">
        <Box
          id={id}
          sx={{
            ...(collapsible && collapsed
              ? {
                  maxHeight: collapsedHeight,
                  overflow: 'hidden',
                }
              : {}),
          }}
        >
          {children}
        </Box>
        {collapsible && collapsed && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
              background: theme => `linear-gradient(transparent, ${theme.palette.background.paper})`,
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>
      {collapsible && (
        <ButtonBase
          onClick={onToggleCollapse}
          aria-expanded={!collapsed}
          aria-controls={id}
          sx={{ justifyContent: 'flex-start', paddingY: 1 }}
        >
          <Typography variant="caption" color="primary">
            {collapsed ? t('comments.expandAll', { count: itemCount }) : t('comments.collapse')}
          </Typography>
        </ButtonBase>
      )}
    </>
  );
};

export default CollapsibleCommentsThread;
