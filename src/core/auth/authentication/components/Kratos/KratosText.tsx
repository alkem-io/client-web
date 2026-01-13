import { FC } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyIcon from '@mui/icons-material/Key';
import { UiNode, UiNodeTextAttributes } from '@ory/kratos-client';
import { useKratosT } from './messages';

interface KratosTextProps {
  node: UiNode & { attributes: UiNodeTextAttributes };
  onRemove?: () => void;
}

/**
 * Renders a Kratos text node, typically used for displaying existing credentials
 * like WebAuthn security keys or passkeys.
 */
export const KratosText: FC<KratosTextProps> = ({ node, onRemove }) => {
  const { t } = useKratosT();
  const { text } = node.attributes;
  const label = node.meta.label;

  // For WebAuthn credentials, the text contains the credential info
  // Label contains the credential name/identifier
  const displayText = label ? t(label) : text.text;

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: 1.5,
        gap: 1.5,
        marginY: 0.5,
      }}
    >
      <KeyIcon color="action" />
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2">{displayText}</Typography>
        {text.text && label && (
          <Typography variant="caption" color="text.secondary">
            {text.text}
          </Typography>
        )}
      </Box>
      {onRemove && (
        <IconButton size="small" onClick={onRemove} aria-label="Remove security key">
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </Paper>
  );
};

export default KratosText;
