import React, { ComponentType, FC, ReactNode, useMemo } from 'react';
import { isMatch, some } from 'lodash';
import { Alert, Box, Button } from '@mui/material';
import { UiContainer, UiNode, UiText } from '@ory/kratos-client';
import { useTranslation } from 'react-i18next';
import {
  guessVariant,
  isAnchorNode,
  isHiddenInput,
  isInputNode,
  isReturnToPlatformLink,
  isSubmitButton,
} from './Kratos/helpers';
import KratosButton from './Kratos/KratosButton';
import KratosCheckbox from './Kratos/KratosCheckbox';
import KratosHidden from './Kratos/KratosHidden';
import KratosInput from './Kratos/KratosInput';
import { KratosInputExtraProps } from './Kratos/KratosProps';
import { useKratosT } from './Kratos/messages';
import isAcceptTermsCheckbox from '../utils/isAcceptTermsCheckbox';
import KratosAcceptTermsCheckbox from './Kratos/KratosAcceptTermsCheckbox';
import Paragraph from '../../../../domain/shared/components/Text/Paragraph';
import AuthActionButton, { AuthActionButtonProps } from './Button';
import { UiNodeInput } from './Kratos/UiNodeTypes';
import { KratosAcceptTermsProps } from '../pages/AcceptTerms';
import { useKratosFormContext } from './Kratos/KratosForm';
import KratosSocialButton from './Kratos/KratosSocialButton';
import { KRATOS_REMOVED_FIELDS_DEFAULT, KratosRemovedFieldAttributes } from './Kratos/constants';

interface KratosUIProps {
  ui?: UiContainer;
  resetPasswordElement?: ReactNode;
  acceptTermsComponent?: ComponentType<KratosAcceptTermsProps>;
  renderAcceptTermsCheckbox?: (checkbox: UiNodeInput) => ReactNode;
  buttonComponent?: ComponentType<AuthActionButtonProps>;
  // TODO Make hidden fields actually consume zero space by changing them into type="hidden" in the UI array
  removedFields?: readonly KratosRemovedFieldAttributes[];
  /**
   * @deprecated - needed to store hasAcceptedTerms before submit.
   * Remove once we're able to make Kratos keep traits.accepted_terms on error.
   */
  onBeforeSubmit?: () => void;
  onClickReturnToPlatform?: () => void;
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

  return (
    <>
      {messages?.map(message => (
        <Alert key={message.id} severity={toAlertVariant(message.type)}>
          {t(message)}
        </Alert>
      ))}
    </>
  );
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
  ui,
  resetPasswordElement,
  acceptTermsComponent: AcceptTerms,
  buttonComponent = AuthActionButton,
  renderAcceptTermsCheckbox = checkbox => <KratosAcceptTermsCheckbox node={checkbox} />,
  children,
  removedFields = KRATOS_REMOVED_FIELDS_DEFAULT,
  onClickReturnToPlatform,
  ...rest
}) => {
  const { t } = useTranslation();

  const kratosFormContext = useKratosFormContext();

  const { t: kratosT } = useKratosT();

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
        if (isHiddenInput(node)) {
          return { ...acc, hidden: [...acc.hidden, node] };
        }
        switch (node.group) {
          case 'default':
            return { ...acc, default: [...acc.default, node] };
          case 'oidc':
            return { ...acc, oidc: [...acc.oidc, node] };
          case 'password':
            if (isSubmitButton(node)) {
              return { ...acc, submit: [...acc.submit, node] };
            }
            return { ...acc, password: [...acc.password, node] };
          default:
            return { ...acc, rest: [...acc.rest, node] };
        }
      },
      { default: [], oidc: [], password: [], rest: [], submit: [], hidden: [] } as NodeGroups
    );
  }, [renderedNodes]);

  if (!nodesByGroup || !ui) return null;

  const toUiControl = (node: UiNode, key: number) => {
    if (isAnchorNode(node)) {
      return (
        <Button
          href={node.attributes.href}
          variant="contained"
          onClick={isReturnToPlatformLink(node) ? onClickReturnToPlatform : undefined}
        >
          {kratosT(node.attributes.title)}
        </Button>
      );
    }

    if (!isInputNode(node)) {
      return <KratosInput key={key} node={node} />;
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
        extraProps.autoComplete = 'password';
        break;
    }

    if (isAcceptTermsCheckbox(node)) {
      return renderAcceptTermsCheckbox(node as UiNodeInput);
    }

    if (node.group === 'oidc' && isSubmitButton(node)) {
      return <KratosSocialButton node={node} buttonComponent={buttonComponent} />;
    }

    switch (node.attributes.type) {
      case 'hidden':
        return <KratosHidden key={key} node={node} />;
      case 'submit':
        return <KratosButton key={key} node={node} />;
      case 'checkbox':
        return <KratosCheckbox key={key} node={node} />;
      default:
        return <KratosInput key={key} node={node} {...extraProps} />;
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
        display="flex"
        flexDirection="column"
        alignItems="stretch"
        gap={2}
        minWidth={theme => ({ sm: theme.spacing(36) })}
      >
        <KratosMessages messages={ui.messages} />
        {nodesByGroup.default.map(toUiControl)}
        {nodesByGroup.password.map(toUiControl)}
        {resetPasswordElement}
        {nodesByGroup.rest.map(toUiControl)}
        <Box alignSelf="center" display="flex" flexDirection="column" alignItems="stretch" gap={2} marginTop={2}>
          {nodesByGroup.submit.map(toUiControl)}
          {nodesByGroup.submit.length > 0 && nodesByGroup.oidc.length > 0 && (
            <Paragraph textAlign="center" marginY={2} textTransform="uppercase">
              {t('common.or')}
            </Paragraph>
          )}
          {nodesByGroup.oidc.map(toUiControl)}
          {children}
        </Box>
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

export const KratosUIContext = React.createContext<KratosUIContextProps>({});

interface KratosUIProviderProps {
  /**
   * @deprecated - it's needed to store hasAcceptedTerms before submit because Kratos can reset the form state.
   * Remove once we're able to make Kratos keep traits.accepted_terms on error.
   */
  onBeforeSubmit?: () => void;
}

export const KratosUIProvider: FC<KratosUIProviderProps> = ({ onBeforeSubmit, children }) => {
  return <KratosUIContext.Provider value={{ onBeforeSubmit }}>{children}</KratosUIContext.Provider>;
};
