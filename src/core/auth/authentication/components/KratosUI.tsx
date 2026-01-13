import { Text } from '@/core/ui/typography';
import { Alert, Box, Button } from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { UiContainer, UiNode, UiNodeInputAttributes, UiText } from '@ory/kratos-client';
import { isMatch, some } from 'lodash';
import { ComponentType, FC, PropsWithChildren, ReactNode, createContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { KratosAcceptTermsProps } from '../pages/AcceptTerms';
import isAcceptTermsCheckbox from '../utils/isAcceptTermsCheckbox';
import KratosAcceptTermsCheckbox from './Kratos/KratosAcceptTermsCheckbox';
import KratosButton from './Kratos/KratosButton';
import KratosCheckbox from './Kratos/KratosCheckbox';
import { useKratosFormContext } from './Kratos/KratosForm';
import KratosHidden from './Kratos/KratosHidden';
import KratosInput from './Kratos/KratosInput';
import { KratosInputExtraProps } from './Kratos/KratosProps';
import KratosSocialButton, { socialCustomizations } from './Kratos/KratosSocialButton';
import { KRATOS_REMOVED_FIELDS_DEFAULT, KratosRemovedFieldAttributes } from './Kratos/constants';
import { guessVariant, isAnchorNode, isHiddenInput, isInputNode, isPasskeyAutocompleteInit, isScriptNode, isSubmitButton, isTextNode, isWebAuthnOrPasskeyTrigger, isWebAuthnMethodButton } from './Kratos/helpers';
import KratosWebAuthnButton from './Kratos/KratosWebAuthnButton';
import KratosWebAuthnIconButton from './Kratos/KratosWebAuthnIconButton';
import KratosText from './Kratos/KratosText';
import useWebAuthnScript from '../hooks/useWebAuthnScript';
import { useKratosT } from './Kratos/messages';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';

interface KratosUIProps extends PropsWithChildren {
  ui?: UiContainer;
  resetPasswordElement?: ReactNode;
  acceptTermsComponent?: ComponentType<KratosAcceptTermsProps>;
  renderAcceptTermsCheckbox?: (checkbox: UiNode) => ReactNode;
  // TODO Make hidden fields actually consume zero space by changing them into type="hidden" in the UI array
  removedFields?: readonly KratosRemovedFieldAttributes[];
  /**
   * @deprecated - needed to store hasAcceptedTerms before submit.
   * Remove once we're able to make Kratos keep traits.accepted_terms on error.
   */
  onBeforeSubmit?: () => void;
  disableInputs?: boolean;
  flowType?: 'login' | 'registration' | 'settings' | 'recovery' | 'verification';
  onInputChange?: (node: UiNode, value: string) => void;
  submitDisabled?: boolean;
}

const toAlertVariant = (type: string) => {
  if (type === 'error') {
    return 'error';
  } else {
    return 'info';
  }
};

const KratosMessages: FC<{ messages?: Array<UiText> }> = ({ messages }) => {
  const { t } = useKratosT();
  if (!messages || !messages.length) return null;

  return (
    <Box marginBottom={1}>
      {messages?.map(message => (
        <Alert key={message.id} severity={toAlertVariant(message.type)}>
          {t(message)}
        </Alert>
      ))}
    </Box>
  );
};

interface NodeGroups {
  default: UiNode[];
  oidc: UiNode[];
  password: UiNode[];
  webauthn: UiNode[];
  webauthnCredentials: UiNode[]; // Existing credentials (text nodes) and remove buttons
  rest: UiNode[];
  submit: UiNode[];
  hidden: UiNode[];
}

export const KratosUI: FC<KratosUIProps> = ({
  ui,
  resetPasswordElement,
  acceptTermsComponent: AcceptTerms,
  renderAcceptTermsCheckbox = checkbox => <KratosAcceptTermsCheckbox node={checkbox} />,
  children,
  removedFields = KRATOS_REMOVED_FIELDS_DEFAULT,
  disableInputs = false,
  flowType,
  onInputChange,
  submitDisabled = false,
  ...rest
}) => {
  const { t } = useTranslation();

  const kratosFormContext = useKratosFormContext();

  const { t: kratosT } = useKratosT();

  // Load WebAuthn/Passkey script if present in nodes
  const { isReady: isWebAuthnScriptReady } = useWebAuthnScript(ui?.nodes);

  const renderedNodes = useMemo(
    () =>
      ui?.nodes.filter(node => {
        return !some(removedFields, fieldDef => isMatch(node.attributes, fieldDef));
      }),
    [ui, removedFields]
  );

  const nodesByGroup = useMemo(() => {
    return renderedNodes?.reduce(
      (acc, node) => {
        // Skip script nodes - they are handled separately by useWebAuthnScript
        if (isScriptNode(node)) {
          return acc;
        }
        if (isHiddenInput(node)) {
          return { ...acc, hidden: [...acc.hidden, node] };
        }
        // Skip passkey autocomplete init nodes entirely - they initialize autocomplete, not visible buttons
        if (isPasskeyAutocompleteInit(node)) {
          return acc;
        }
        switch (node.group) {
          case 'default':
            return { ...acc, default: [...acc.default, node] };
          case 'oidc':
            return { ...acc, oidc: [...acc.oidc, node] };
          case 'webauthn':
          case 'passkey':
            // WebAuthn/Passkey trigger buttons go to webauthn group
            if (isWebAuthnOrPasskeyTrigger(node)) {
              return { ...acc, webauthn: [...acc.webauthn, node] };
            }
            // Text nodes (existing credentials) go to webauthnCredentials
            if (isTextNode(node)) {
              return { ...acc, webauthnCredentials: [...acc.webauthnCredentials, node] };
            }
            // Remove buttons for existing credentials go to webauthnCredentials
            if (isSubmitButton(node)) {
              return { ...acc, webauthnCredentials: [...acc.webauthnCredentials, node] };
            }
            // Other webauthn nodes (like hidden inputs) go to hidden or rest
            if (isHiddenInput(node)) {
              return { ...acc, hidden: [...acc.hidden, node] };
            }
            return { ...acc, rest: [...acc.rest, node] };
          case 'code':
          case 'password':
            if (isSubmitButton(node)) {
              return { ...acc, submit: [...acc.submit, node] };
            }
            return { ...acc, password: [...acc.password, node] };
          case 'profile':
            if (isSubmitButton(node)) {
              return { ...acc, submit: [...acc.submit, node] };
            }
            return { ...acc, password: [...acc.password, node] };
          default:
            return { ...acc, rest: [...acc.rest, node] };
        }
      },
      { default: [], oidc: [], password: [], webauthn: [], webauthnCredentials: [], rest: [], submit: [], hidden: [] } as NodeGroups
    );
  }, [renderedNodes]);

  if (!nodesByGroup || !ui) return null;

  const toUiControl = (node: UiNode, key: number) => {
    if (isAnchorNode(node)) {
      return (
        <Button
          href={node.attributes.href}
          variant="contained"
          key={key}
          sx={{ backgroundColor: theme => theme.palette.highlight.dark }}
        >
          {kratosT(node.attributes.title)}
        </Button>
      );
    }

    // Handle text nodes (used for displaying existing credentials)
    if (isTextNode(node)) {
      return <KratosText key={key} node={node} />;
    }

    if (!isInputNode(node)) {
      return <KratosInput key={key} node={node} onValueChange={value => onInputChange?.(node, value)} />;
    }

    const variant = guessVariant(node);

    const extraProps: KratosInputExtraProps = {
      autoCapitalize: 'off',
      autoCorrect: 'off',
    };

    switch (variant) {
      case 'email':
      case 'username':
        extraProps.autoComplete = 'username';
        break;
      case 'password':
        // Use correct autocomplete values based on flow type
        if (flowType === 'registration') {
          extraProps.autoComplete = 'new-password';
        } else if (flowType === 'login') {
          extraProps.autoComplete = 'current-password';
        } else {
          extraProps.autoComplete = 'current-password'; // default fallback
        }
        break;
    }

    if (isAcceptTermsCheckbox(node)) {
      return <Box key={key}>{renderAcceptTermsCheckbox(node)}</Box>;
    }

    if (node.group === 'oidc' && isSubmitButton(node)) {
      return <KratosSocialButton key={node.attributes.value} node={node} disabled={disableInputs} />;
    }

    // Handle WebAuthn/Passkey trigger buttons
    if ((node.group === 'webauthn' || node.group === 'passkey') && isWebAuthnOrPasskeyTrigger(node)) {
      return (
        <KratosWebAuthnButton
          key={key}
          node={node}
          isScriptLoaded={isWebAuthnScriptReady}
          disabled={disableInputs}
        />
      );
    }

    switch (node.attributes.type) {
      case 'hidden':
        return <KratosHidden key={key} node={node} />;
      case 'submit':
        if (node.attributes.value.includes(':back')) {
          return <KratosButton key={key} node={node} variant="text" />;
        }
        // Check for WebAuthn/Passkey triggers - these call Ory WebAuthn functions
        if (isWebAuthnOrPasskeyTrigger(node)) {
          return (
            <KratosWebAuthnButton
              key={key}
              node={node}
              isScriptLoaded={isWebAuthnScriptReady}
              disabled={disableInputs}
            />
          );
        }
        // Check for WebAuthn/Passkey method buttons - these are regular submit buttons with icons
        if (isWebAuthnMethodButton(node)) {
          const isPasskey = node.attributes.value === 'passkey';
          return (
            <KratosButton
              sx={{ paddingY: 1, backgroundColor: theme => theme.palette.highlight.dark }}
              key={key}
              node={node}
              disabled={disableInputs || submitDisabled}
              startIcon={isPasskey ? <FingerprintIcon /> : <KeyIcon />}
            />
          );
        }
        return (
          <KratosButton
            sx={{ paddingY: 1, backgroundColor: theme => theme.palette.highlight.dark }}
            key={key}
            node={node}
            disabled={disableInputs || submitDisabled}
          />
        );
      case 'checkbox':
        return <KratosCheckbox key={key} node={node} />;
      default:
        return (
          <KratosInput
            key={key}
            node={node}
            disabled={disableInputs}
            {...extraProps}
            onValueChange={value => onInputChange?.(node, value)}
          />
        );
    }
  };

  if (!kratosFormContext) {
    throw new Error('Not within a KratosForm');
  }

  return (
    <KratosUIProvider {...rest}>
      {nodesByGroup.hidden.map(toUiControl)}
      {!kratosFormContext.isFormValid && (
        <Alert severity={'warning'} onClose={() => kratosFormContext.setIsFormValid(true)}>
          {t('authentication.validation.fill-fields')}
        </Alert>
      )}
      <Box
        paddingTop={0}
        display="flex"
        flexDirection="column"
        alignItems="stretch"
        gap={1}
        width="100%"
        minWidth={theme => ({ sm: theme.spacing(36) })}
      >
        <KratosMessages messages={ui.messages} />
        {nodesByGroup.default.map(toUiControl)}
        {nodesByGroup.password.map(toUiControl)}
        {resetPasswordElement}
        {nodesByGroup.rest.map(toUiControl)}
        {children}
        {nodesByGroup.submit.length > 0 && (
          <Box alignSelf="center" display="flex" flexDirection="column" gap={1} paddingY={1.5} width="100%">
            {nodesByGroup.submit.map(toUiControl)}
            {/* Show "or" if there are WebAuthn or OIDC buttons to show after */}
            {(nodesByGroup.webauthn.length > 0 || nodesByGroup.oidc.length > 0) && (
              <Text textAlign="center">{t('authentication.or')}</Text>
            )}
          </Box>
        )}
        {nodesByGroup.webauthnCredentials.length > 0 && (
          <Box display="flex" flexDirection="column" gap={1} paddingY={1} width="100%">
            {nodesByGroup.webauthnCredentials.map(toUiControl)}
          </Box>
        )}
        {/* For login flows, render WebAuthn icon buttons alongside OIDC buttons */}
        {flowType === 'login' && nodesByGroup.webauthn.length > 0 && nodesByGroup.oidc.length > 0 && (
          <Gutters row sx={{ gap: gutters(0.5), justifyContent: 'center', padding: 0 }}>
            {nodesByGroup.webauthn.map((node, index) => (
              <KratosWebAuthnIconButton
                key={`webauthn-${index}`}
                node={node as UiNode & { attributes: UiNodeInputAttributes }}
                isScriptLoaded={isWebAuthnScriptReady}
                disabled={disableInputs}
              />
            ))}
            {[...nodesByGroup.oidc]
              .sort((a, b) => {
                const aValue = isInputNode(a) ? a.attributes.value : '';
                const bValue = isInputNode(b) ? b.attributes.value : '';

                const aOrder = socialCustomizations[aValue]?.sortOrder ?? 0;
                const bOrder = socialCustomizations[bValue]?.sortOrder ?? 0;

                return aOrder - bOrder;
              })
              .map(toUiControl)}
          </Gutters>
        )}
        {/* For login flows with only WebAuthn (no OIDC), show icon buttons in a row */}
        {flowType === 'login' && nodesByGroup.webauthn.length > 0 && nodesByGroup.oidc.length === 0 && (
          <Gutters row sx={{ gap: gutters(0.5), justifyContent: 'center', padding: 0 }}>
            {nodesByGroup.webauthn.map((node, index) => (
              <KratosWebAuthnIconButton
                key={`webauthn-${index}`}
                node={node as UiNode & { attributes: UiNodeInputAttributes }}
                isScriptLoaded={isWebAuthnScriptReady}
                disabled={disableInputs}
              />
            ))}
          </Gutters>
        )}
        {/* For non-login flows (settings, registration), keep full-width WebAuthn buttons */}
        {flowType !== 'login' && nodesByGroup.webauthn.length > 0 && (
          <Box display="flex" flexDirection="column" gap={1} paddingY={1.5} width="100%">
            {nodesByGroup.webauthn.map(toUiControl)}
            {nodesByGroup.oidc.length > 0 && <Text textAlign="center">{t('authentication.or')}</Text>}
          </Box>
        )}
        {/* OIDC buttons for non-login flows, or when there are no WebAuthn buttons in login flow */}
        {(flowType !== 'login' || nodesByGroup.webauthn.length === 0) && nodesByGroup.oidc.length > 0 && (
          <Gutters row sx={{ gap: gutters(0.5), justifyContent: 'center', padding: 0 }}>
            {[...nodesByGroup.oidc]
              .sort((a, b) => {
                const aValue = isInputNode(a) ? a.attributes.value : '';
                const bValue = isInputNode(b) ? b.attributes.value : '';

                const aOrder = socialCustomizations[aValue]?.sortOrder ?? 0;
                const bOrder = socialCustomizations[bValue]?.sortOrder ?? 0;

                return aOrder - bOrder;
              })
              .map(toUiControl)}
          </Gutters>
        )}
      </Box>
    </KratosUIProvider>
  );
};

export default KratosUI;

interface KratosUIContextProps {
  /**
   * @deprecated - it's needed to store hasAcceptedTerms before submit because Kratos can reset the form state.
   * Remove once we're able to make Kratos keep traits.accepted_terms on error.
   */
  onBeforeSubmit?: () => void;
}

export const KratosUIContext = createContext<KratosUIContextProps>({});

interface KratosUIProviderProps extends PropsWithChildren {
  /**
   * @deprecated - it's needed to store hasAcceptedTerms before submit because Kratos can reset the form state.
   * Remove once we're able to make Kratos keep traits.accepted_terms on error.
   */
  onBeforeSubmit?: () => void;
}

export const KratosUIProvider: FC<KratosUIProviderProps> = ({ onBeforeSubmit, children }) => {
  return <KratosUIContext value={{ onBeforeSubmit }}>{children}</KratosUIContext>;
};
