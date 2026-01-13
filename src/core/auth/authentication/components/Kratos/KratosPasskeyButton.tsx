import { FC, useCallback, useState } from 'react';
import { Box, Button, CircularProgress, Alert } from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { UiNode, UiNodeInputAttributes } from '@ory/kratos-client';
import { useTranslation } from 'react-i18next';
import { getNodeName, getNodeTitle, getPasskeyTriggerType } from './helpers';

// Global type declarations for Ory Passkey functions
declare global {
  interface Window {
    __oryPasskeyLogin?: () => Promise<void>;
    __oryPasskeyLoginAutocompleteInit?: () => Promise<void>;
    __oryPasskeyRegistration?: () => Promise<void>;
    __oryPasskeySettingsRegistration?: () => Promise<void>;
  }
}

interface KratosPasskeyButtonProps {
  node: UiNode & { attributes: UiNodeInputAttributes };
  isScriptLoaded: boolean;
  disabled?: boolean;
}

const KratosPasskeyButton: FC<KratosPasskeyButtonProps> = ({ node, isScriptLoaded, disabled = false }) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  const attributes = node.attributes;
  // Use helper to get trigger type from either onclickTrigger or deprecated onclick attribute
  const triggerType = getPasskeyTriggerType(node);

  const handleClick = useCallback(async () => {
    if (!isScriptLoaded) {
      setPasskeyError(t('authentication.passkey.script-loading'));
      return;
    }

    // Check browser support
    if (!window.PublicKeyCredential) {
      setPasskeyError(t('authentication.passkey.not-supported'));
      return;
    }

    setIsProcessing(true);
    setPasskeyError(null);

    try {
      // If the node has an onclick attribute with inline JS, execute it directly
      // This is how Ory Kratos passes passkey options to the client
      if (attributes.onclick) {
        // The onclick contains JavaScript like: window.__oryPasskeyLogin({...options...})
        // We need to execute it using eval (this is the recommended approach by Ory for SPAs)
        eval(attributes.onclick);
      } else if (attributes.onclickTrigger) {
        // Modern Kratos uses onclickTrigger instead of onclick
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
      // User cancelled or other error
      const message = err instanceof Error ? err.message : t('authentication.passkey.unknown-error');
      setPasskeyError(message);
    } finally {
      setIsProcessing(false);
    }
  }, [isScriptLoaded, triggerType, attributes.onclick, attributes.onclickTrigger, t]);

  const isButtonDisabled = attributes.disabled || disabled || !isScriptLoaded || isProcessing;
  const buttonLabel = getNodeTitle(node, t) ?? t('authentication.passkey.sign-in');

  return (
    <Box display="flex" flexDirection="column" gap={1} width="100%">
      <Button
        name={getNodeName(node)}
        type="button"
        disabled={isButtonDisabled}
        value={attributes.value}
        onClick={handleClick}
        variant="contained"
        startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <FingerprintIcon />}
        sx={{
          paddingY: 1,
          backgroundColor: theme => theme.palette.highlight.dark,
          width: '100%',
        }}
      >
        {buttonLabel}
      </Button>
      {/* Hidden input for Passkey response - populated by Ory script */}
      <input type="hidden" name={attributes.name} />
      {passkeyError && (
        <Alert severity="warning" onClose={() => setPasskeyError(null)}>
          {passkeyError}
        </Alert>
      )}
    </Box>
  );
};

export default KratosPasskeyButton;
