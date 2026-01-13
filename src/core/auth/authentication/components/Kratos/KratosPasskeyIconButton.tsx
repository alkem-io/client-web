import { FC, useCallback, useState } from 'react';
import { Box, Button, CircularProgress, Tooltip, Alert } from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { UiNode, UiNodeInputAttributes } from '@ory/kratos-client';
import { useTranslation } from 'react-i18next';
import { getNodeName, getNodeTitle, getPasskeyTriggerType } from './helpers';

interface KratosPasskeyIconButtonProps {
  node: UiNode & { attributes: UiNodeInputAttributes };
  isScriptLoaded: boolean;
  disabled?: boolean;
}

const KratosPasskeyIconButton: FC<KratosPasskeyIconButtonProps> = ({ node, isScriptLoaded, disabled = false }) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  const attributes = node.attributes;
  const triggerType = getPasskeyTriggerType(node);

  const handleClick = useCallback(async () => {
    if (!isScriptLoaded) {
      setPasskeyError(t('authentication.passkey.script-loading'));
      return;
    }

    if (!window.PublicKeyCredential) {
      setPasskeyError(t('authentication.passkey.not-supported'));
      return;
    }

    setIsProcessing(true);
    setPasskeyError(null);

    try {
      if (attributes.onclick) {
        eval(attributes.onclick);
      } else if (attributes.onclickTrigger) {
        switch (triggerType) {
          case 'oryPasskeyLogin':
            await window.__oryPasskeyLogin?.();
            break;
          case 'oryPasskeyLoginAutocompleteInit':
            await window.__oryPasskeyLoginAutocompleteInit?.();
            break;
          case 'oryPasskeyRegistration':
            await window.__oryPasskeyRegistration?.();
            break;
          case 'oryPasskeySettingsRegistration':
            await window.__oryPasskeySettingsRegistration?.();
            break;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('authentication.passkey.unknown-error');
      setPasskeyError(message);
    } finally {
      setIsProcessing(false);
    }
  }, [isScriptLoaded, triggerType, attributes.onclick, attributes.onclickTrigger, t]);

  const isButtonDisabled = attributes.disabled || disabled || !isScriptLoaded || isProcessing;
  const buttonLabel = getNodeTitle(node, t) ?? t('authentication.passkey.sign-in');

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Box
        sx={{
          height: 55,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Tooltip title={buttonLabel} placement="top" arrow>
          <Button
            name={getNodeName(node)}
            type="button"
            disabled={isButtonDisabled}
            value={attributes.value}
            onClick={handleClick}
            variant="contained"
            sx={{
              background: theme => theme.palette.background.paper,
              padding: 0,
              height: '100%',
              margin: 0,
              '&.Mui-disabled': {
                opacity: 0.6,
              },
            }}
          >
            {isProcessing ? (
              <CircularProgress size={32} color="inherit" />
            ) : (
              <FingerprintIcon sx={{ fontSize: 32, color: theme => theme.palette.primary.main }} />
            )}
          </Button>
        </Tooltip>
        <input type="hidden" name={attributes.name} />
      </Box>
      {passkeyError && (
        <Alert severity="warning" onClose={() => setPasskeyError(null)}>
          {passkeyError}
        </Alert>
      )}
    </Box>
  );
};

export default KratosPasskeyIconButton;
