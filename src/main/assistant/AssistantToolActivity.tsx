import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import { type ToolActivityPart, ToolActivityStatus } from './types';

/**
 * Human-readable indication of a tool being used, e.g. "Searching whiteboards…"
 * with started/finished/error status (FR-004). The `label` is server-provided
 * (browser-assistant-sse.md `tool-activity` payload) — the browser holds no
 * tool logic; it only renders the label and status.
 */
export const AssistantToolActivity = ({ part }: { part: ToolActivityPart }) => {
  const { t } = useTranslation();

  const icon =
    part.status === ToolActivityStatus.Finished ? (
      <CheckCircleOutlineIcon fontSize="small" color="success" aria-hidden={true} />
    ) : part.status === ToolActivityStatus.Error ? (
      <ErrorOutlineIcon fontSize="small" color="error" aria-hidden={true} />
    ) : (
      <CircularProgress size={14} aria-hidden={true} />
    );

  const text =
    part.status === ToolActivityStatus.Error
      ? t('assistant.toolActivity.error', { label: part.label })
      : t('assistant.toolActivity.started', { label: part.label });

  return (
    <Box display="flex" alignItems="center" gap={gutters(0.5)} role="status">
      {icon}
      <Typography variant="caption" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );
};
