import { Alert, Box, ButtonProps } from '@mui/material';
import {
  SelfServiceLoginFlow,
  SelfServiceRecoveryFlow,
  SelfServiceRegistrationFlow,
  SelfServiceSettingsFlow,
  SelfServiceVerificationFlow,
  UiNode,
  UiText,
} from '@ory/kratos-client';
import React, { ComponentType, FC, FormEvent, ReactNode, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getNodeName, getNodeValue, guessVariant, isUiNodeInputAttributes } from './Kratos/helpers';
import KratosButton from './Kratos/KratosButton';
import KratosCheckbox from './Kratos/KratosCheckbox';
import KratosHidden from './Kratos/KratosHidden';
import KratosInput from './Kratos/KratosInput';
import { KratosInputExtraProps } from './Kratos/KratosProps';
import { KratosFriendlierMessageMapper } from './Kratos/messages';
import { sxCols } from '../../../../domain/shared/layout/Grid';
import isAcceptTermsCheckbox from '../utils/isAcceptTermsCheckbox';
import KratosAcceptTermsCheckbox from './Kratos/KratosAcceptTermsCheckbox';
import Paragraph from '../../../../domain/shared/components/Text/Paragraph';
import ButtonStyling from './AuthProviders/ButtonStyling';
import AuthActionButton, { AuthActionButtonProps } from './Button';
import linkedInTheme from './AuthProviders/LinkedInTheme';
import { ReactComponent as LinkedInIcon } from './AuthProviders/LinkedIn.svg';
import microsoftTheme from './AuthProviders/MicrosoftTheme';
import { ReactComponent as MicrosoftIcon } from './AuthProviders/Microsoft.svg';
import { UiNodeInput } from './UiNodeInput';
import { KratosAcceptTermsProps } from '../pages/AcceptTerms';
import produce from 'immer';
import TranslationKey from '../../../../types/TranslationKey';

interface KratosUIProps {
  flow:
    | SelfServiceLoginFlow
    | SelfServiceRegistrationFlow
    | SelfServiceSettingsFlow
    | SelfServiceVerificationFlow
    | SelfServiceRecoveryFlow
    | undefined;
  resetPasswordElement?: ReactNode;
  acceptTermsComponent?: ComponentType<KratosAcceptTermsProps>;
  renderAcceptTermsCheckbox?: (checkbox: UiNodeInput) => ReactNode;
  buttonComponent?: ComponentType<AuthActionButtonProps>;
  // TODO Make hidden fields actually consume zero space by changing them into type="hidden" in the UI array
  hideFields?: string[];
  /**
   * @deprecated - needed to store hasAcceptedTerms before submit.
   * Remove once we're able to make Kratos keep traits.accepted_terms on error.
   */
  onBeforeSubmit?: () => void;
}

const toAlertVariant = (type: string) => {
  if (type === 'error') {
    return 'error';
  } else {
    return 'info';
  }
};

const KratosMessages: FC<{ messages?: Array<UiText> }> = ({ messages }) => {
  const { t } = useTranslation();
  const getFriendlierMessage = useMemo(() => KratosFriendlierMessageMapper(t), [t]);

  return (
    <>
      {messages?.map(message => (
        <Alert key={message.id} severity={toAlertVariant(message.type)}>
          {getFriendlierMessage(message)}
        </Alert>
      ))}
    </>
  );
};

interface SocialCustomization {
  icon: FC<React.SVGProps<SVGSVGElement> & { title?: string }>;
  theme: { palette: { primary: { main: string } } };
  label: string;
}

const socialCustomizations: Record<string, SocialCustomization> = {
  linkedin: {
    theme: linkedInTheme,
    icon: LinkedInIcon,
    label: 'linkedin',
  },
  microsoft: {
    theme: microsoftTheme,
    icon: MicrosoftIcon,
    label: 'microsoft',
  },
};

interface NodeGroups {
  default: UiNode[];
  oidc: UiNode[];
  password: UiNode[];
  rest: UiNode[];
  submit: UiNode[];
  hidden: UiNode[];
}

export const KratosUI: FC<KratosUIProps> = ({
  resetPasswordElement,
  flow,
  acceptTermsComponent: AcceptTerms,
  buttonComponent: Button = AuthActionButton,
  renderAcceptTermsCheckbox = checkbox => <KratosAcceptTermsCheckbox node={checkbox} />,
  children,
  ...rest
}) => {
  const { t, i18n } = useTranslation();
  const [showFormAlert, setShowFormAlert] = useState(false);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    const button = getActiveElement() as HTMLButtonElement | null;
    // do check if only submitting password method
    if (button && button.name === 'method' && button.value === 'password') {
      if (!e.currentTarget.checkValidity()) {
        setShowFormAlert(true);
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
  }, []);

  const termsCheckbox = flow?.ui.nodes.find(isAcceptTermsCheckbox) as UiNodeInput | undefined;
  const isAcceptTermsMode = termsCheckbox && AcceptTerms ? !termsCheckbox.attributes.value : false;

  const ui = useMemo(() => {
    return (
      flow &&
      produce(flow.ui, nextUi => {
        const termsCheckbox = nextUi.nodes.find(isAcceptTermsCheckbox) as UiNodeInput | undefined;
        const isAcceptTermsMode = termsCheckbox && AcceptTerms ? !termsCheckbox.attributes.value : false;

        // Hiding all UI elements in "Accept Terms" mode except for Accept Terms checkbox
        if (isAcceptTermsMode) {
          nextUi.nodes = nextUi.nodes
            .filter(node => !isAcceptTermsCheckbox(node))
            .filter(node => node.attributes['type'] !== 'submit')
            .map(node => ({
              ...node,
              attributes: {
                ...node.attributes,
                type: 'hidden',
              },
            }));
        }
      })
    );
  }, [flow, AcceptTerms]);

  const nodesByGroup = useMemo(() => {
    return ui?.nodes.reduce(
      (acc, node) => {
        if (node.group !== 'oidc' && node.attributes['type'] === 'submit') {
          return { ...acc, submit: [...acc.submit, node] };
        }
        if (node.attributes['type'] === 'hidden') {
          return { ...acc, hidden: [...acc.hidden, node] };
        }
        switch (node.group) {
          case 'default':
            return { ...acc, default: [...acc.default, node] };
          case 'oidc':
            return { ...acc, oidc: [...acc.oidc, node] };
          case 'password':
            return { ...acc, password: [...acc.password, node] };
          default:
            return { ...acc, rest: [...acc.rest, node] };
        }
      },
      { default: [], oidc: [], password: [], rest: [], submit: [], hidden: [] } as NodeGroups
    );
  }, [ui]);

  if (!nodesByGroup || !ui) return null;

  const getActiveElement = (doc?: Document): Element | null => {
    doc = doc || (typeof document !== 'undefined' ? document : undefined);
    if (typeof doc === 'undefined') {
      return null;
    }
    try {
      return doc.activeElement || doc.body;
    } catch (e) {
      return doc.body;
    }
  };

  const toUiControl = (node: UiNode, key: number) => {
    const attributes = node.attributes;
    if (isUiNodeInputAttributes(attributes)) {
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
          extraProps.autoComplete = 'password';
          break;
      }

      if (isAcceptTermsCheckbox(node)) {
        return renderAcceptTermsCheckbox(node as UiNodeInput);
      }

      if (node.group === 'oidc' && attributes.type === 'submit') {
        const Icon = socialCustomizations[attributes.value]?.icon;

        const label = i18n.exists(`authentication.social-login.providers.${attributes.value}`)
          ? t('authentication.social-login.connect', {
              provider: t(`authentication.social-login.providers.${attributes.value}` as TranslationKey),
            })
          : node.meta.label?.text;

        return (
          <ButtonStyling
            styles={socialCustomizations[attributes.value]?.theme}
            icon={Icon && <Icon />}
            component={Button as ComponentType<ButtonProps>}
            justifyContent="start"
            name={attributes.name}
            type={attributes.type}
            value={attributes.value}
          >
            {label}
          </ButtonStyling>
        );
      }

      switch (attributes.type) {
        case 'hidden':
          return <KratosHidden key={key} node={node} />;
        case 'submit':
          return <KratosButton key={key} node={node} />;
        case 'checkbox':
          return <KratosCheckbox key={key} node={node} />;
        default:
          return <KratosInput key={key} node={node} {...extraProps} />;
      }
    } else {
      return <KratosInput key={key} node={node} />;
    }
  };

  const renderAcceptTerms = () => {
    if (!isAcceptTermsMode) {
      return;
    }

    const AcceptTermsComponent = AcceptTerms!; // ensured by isAcceptTermsMode

    const userNameInput = flow?.ui.nodes.find(node => node.attributes['name'] === 'traits.name.first') as
      | UiNodeInput<string>
      | undefined;
    const userName = userNameInput?.attributes.value ?? undefined ?? 'AndrewТеб';

    const buttonNode = flow?.ui.nodes
      .slice()
      .sort(node => (node.group === 'oidc' ? 1 : -1))
      .find(node => node.attributes['type'] === 'submit') as UiNodeInput;

    return <AcceptTermsComponent userName={userName} checkboxNode={termsCheckbox!} buttonNode={buttonNode} />;
  };

  return (
    <KratosUIProvider {...rest}>
      {showFormAlert && (
        <Alert severity={'warning'} onClose={() => setShowFormAlert(false)}>
          {t('authentication.validation.fill-fields')}
        </Alert>
      )}
      <form action={ui.action} method={ui.method} noValidate onSubmit={handleSubmit}>
        {nodesByGroup.hidden.map(toUiControl)}
        {renderAcceptTerms()}
        <Box display="flex" flexDirection="column" alignItems="stretch" gap={2} width={sxCols(4)}>
          <KratosMessages messages={ui.messages} />
          {nodesByGroup.default.map(toUiControl)}
          {nodesByGroup.password.map(toUiControl)}
          {resetPasswordElement}
          {nodesByGroup.rest.map(toUiControl)}
          <Box alignSelf="center" display="flex" flexDirection="column" alignItems="stretch" gap={2} marginTop={2}>
            {nodesByGroup.submit.map(toUiControl)}
            {nodesByGroup.submit.length > 0 && nodesByGroup.oidc.length > 0 && (
              <Paragraph textAlign="center" marginY={2} textTransform="uppercase">
                Or
              </Paragraph>
            )}
            {nodesByGroup.oidc.map(toUiControl)}
            {children}
          </Box>
        </Box>
      </form>
    </KratosUIProvider>
  );
};
export default KratosUI;

interface KratosUIContextProps {
  termsURL?: string;
  privacyURL?: string;
  isHidden: (node: UiNode) => boolean;
  /**
   * @deprecated - it's needed to store hasAcceptedTerms before submit because Kratos can reset the form state.
   * Remove once we're able to make Kratos keep traits.accepted_terms on error.
   */
  onBeforeSubmit?: () => void;
}

export const KratosUIContext = React.createContext<KratosUIContextProps>({ isHidden: (_node: UiNode) => false });

interface KratosUIProviderProps {
  hideFields?: string[];
  /**
   * @deprecated - it's needed to store hasAcceptedTerms before submit because Kratos can reset the form state.
   * Remove once we're able to make Kratos keep traits.accepted_terms on error.
   */
  onBeforeSubmit?: () => void;
}

export const KratosUIProvider: FC<KratosUIProviderProps> = ({ hideFields, onBeforeSubmit, children }) => {
  const isHidden = useCallback(
    (node: UiNode) => {
      if (!hideFields) return false;
      const name = getNodeName(node);

      if (name === 'method') {
        const value = getNodeValue(node)?.toString() || '';
        return hideFields.includes(value);
      }
      return hideFields.includes(name);
    },
    [hideFields]
  );
  return (
    <KratosUIContext.Provider
      value={{
        isHidden,
        onBeforeSubmit,
      }}
    >
      {children}
    </KratosUIContext.Provider>
  );
};
