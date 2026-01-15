import { FC, useCallback, useState } from 'react';
import { Box, Button, CircularProgress, Alert } from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { UiNode, UiNodeInputAttributes } from '@ory/kratos-client';
import { useTranslation } from 'react-i18next';
import { getNodeName, getNodeTitle, getPasskeyTriggerType } from './helpers';

// Global type declarations for Ory Passkey functions
// Options parameter is passed by the Ory script with WebAuthn credentials
declare global {
  interface Window {
    __oryPasskeyLogin?: (options?: unknown) => Promise<void>;
    __oryPasskeyLoginAutocompleteInit?: (options?: unknown) => Promise<void>;
    __oryPasskeyRegistration?: (options?: unknown) => Promise<void>;
    __oryPasskeySettingsRegistration?: (options?: unknown) => Promise<void>;
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
      // If the node has an onclick attribute with inline JS, execute it
      // This is how Ory Kratos passes passkey options to the client
      // The onclick contains JavaScript like: window.__oryPasskeyLogin({...options...})
      if (attributes.onclick) {
        // Use Function constructor instead of eval for slightly better security
        // (still executes arbitrary code but is more explicit and doesn't access local scope)
        const fn = new Function(attributes.onclick);
        await fn();
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
          default:
            throw new Error(`Unknown passkey trigger type: ${triggerType}`);
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

  // Note: We don't disable the button while script is loading - clicking will show an error message
  // This makes the script-loading error message reachable for UX feedback
  const isButtonDisabled = attributes.disabled || disabled || isProcessing;
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
