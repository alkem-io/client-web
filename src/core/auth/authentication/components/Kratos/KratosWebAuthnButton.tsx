import { FC, useCallback, useState } from 'react';
import { Box, Button, CircularProgress, Alert } from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { UiNode, UiNodeInputAttributes } from '@ory/kratos-client';
import { useTranslation } from 'react-i18next';
import { getNodeName, getNodeTitle, getWebAuthnTriggerType } from './helpers';

// Global type declarations for Ory WebAuthn functions
declare global {
  interface Window {
    __oryWebAuthnLogin?: () => Promise<void>;
    __oryWebAuthnRegistration?: () => Promise<void>;
    __oryPasskeyLogin?: () => Promise<void>;
    __oryPasskeyLoginAutocompleteInit?: () => Promise<void>;
    __oryPasskeyRegistration?: () => Promise<void>;
    __oryPasskeySettingsRegistration?: () => Promise<void>;
  }
}

interface KratosWebAuthnButtonProps {
  node: UiNode & { attributes: UiNodeInputAttributes };
  isScriptLoaded: boolean;
  disabled?: boolean;
}

const isPasskeyTrigger = (trigger: string | undefined): boolean => {
  return trigger?.startsWith('oryPasskey') ?? false;
};

const KratosWebAuthnButton: FC<KratosWebAuthnButtonProps> = ({ node, isScriptLoaded, disabled = false }) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [webAuthnError, setWebAuthnError] = useState<string | null>(null);

  const attributes = node.attributes;
  // Use helper to get trigger type from either onclickTrigger or deprecated onclick attribute
  const triggerType = getWebAuthnTriggerType(node);
  const isPasskey = isPasskeyTrigger(triggerType);

  const handleClick = useCallback(async () => {
    if (!isScriptLoaded) {
      setWebAuthnError(t('authentication.webauthn.script-loading'));
      return;
    }

    // Check browser support
    if (!window.PublicKeyCredential) {
      setWebAuthnError(t('authentication.webauthn.not-supported'));
      return;
    }

    setIsProcessing(true);
    setWebAuthnError(null);

    try {
      // If the node has an onclick attribute with inline JS, execute it directly
      // This is how Ory Kratos passes WebAuthn options to the client
      if (attributes.onclick) {
        // The onclick contains JavaScript like: window.__oryWebAuthnLogin({...options...})
        // We need to execute it using eval (this is the recommended approach by Ory for SPAs)
        eval(attributes.onclick);
      } else if (attributes.onclickTrigger) {
        // Modern Kratos uses onclickTrigger instead of onclick
        switch (triggerType) {
          case 'oryWebAuthnLogin':
            await window.__oryWebAuthnLogin?.();
            break;
          case 'oryWebAuthnRegistration':
            await window.__oryWebAuthnRegistration?.();
            break;
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
      const message = err instanceof Error ? err.message : t('authentication.webauthn.unknown-error');
      setWebAuthnError(message);
    } finally {
      setIsProcessing(false);
    }
  }, [isScriptLoaded, triggerType, attributes.onclick, attributes.onclickTrigger, t]);

  const isButtonDisabled = attributes.disabled || disabled || !isScriptLoaded || isProcessing;
  const buttonLabel = getNodeTitle(node, t) ?? (isPasskey ? t('authentication.webauthn.sign-in-with-passkey') : t('authentication.webauthn.sign-in-with-security-key'));
  const Icon = isPasskey ? FingerprintIcon : KeyIcon;

  return (
    <Box display="flex" flexDirection="column" gap={1} width="100%">
      <Button
        name={getNodeName(node)}
        type="button"
        disabled={isButtonDisabled}
        value={attributes.value}
        onClick={handleClick}
        variant="contained"
        startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <Icon />}
        sx={{
          paddingY: 1,
          backgroundColor: theme => theme.palette.highlight.dark,
          width: '100%',
        }}
      >
        {buttonLabel}
      </Button>
      {/* Hidden input for WebAuthn/Passkey response - populated by Ory script */}
      <input type="hidden" name={attributes.name} />
      {webAuthnError && (
        <Alert severity="warning" onClose={() => setWebAuthnError(null)}>
          {webAuthnError}
        </Alert>
      )}
    </Box>
  );
};

export default KratosWebAuthnButton;
