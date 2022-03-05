import { Grid } from '@mui/material';
import { Alert } from '@mui/material';
import {
  UiNode,
  UiText,
  SelfServiceLoginFlow,
  SelfServiceRegistrationFlow,
  SelfServiceSettingsFlow,
  SelfServiceVerificationFlow,
  SelfServiceRecoveryFlow,
  SubmitSelfServiceLoginFlowBody,
  SubmitSelfServiceRegistrationFlowBody,
  SubmitSelfServiceVerificationFlowWithLinkMethodBody,
  SubmitSelfServiceRecoveryFlowWithLinkMethodBody,
  SubmitSelfServiceSettingsFlowBody,
} from '@ory/kratos-client';
import React, { FC, FormEvent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Delimiter from '../core/Delimiter';
import { getNodeName, getNodeValue, guessVariant, isUiNodeInputAttributes } from './Kratos/helpers';
import KratosButton from './Kratos/KratosButton';
import KratosCheckbox from './Kratos/KratosCheckbox';
import KratosHidden from './Kratos/KratosHidden';
import KratosInput from './Kratos/KratosInput';
import { KratosInputExtraProps } from './Kratos/KratosProps';
import { KratosFriendlierMessageMapper } from './Kratos/messages';

type FormType =
  | SubmitSelfServiceLoginFlowBody
  | SubmitSelfServiceSettingsFlowBody
  | SubmitSelfServiceRegistrationFlowBody
  | SubmitSelfServiceVerificationFlowWithLinkMethodBody
  | SubmitSelfServiceRecoveryFlowWithLinkMethodBody;
interface KratosUIProps {
  flow?:
    | SelfServiceLoginFlow
    | SelfServiceRegistrationFlow
    | SelfServiceSettingsFlow
    | SelfServiceVerificationFlow
    | SelfServiceRecoveryFlow;
  termsURL?: string;
  privacyURL?: string;
  resetPasswordComponent?: React.ReactChild;
  hideFields?: string[];
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
  const getFriendlierMessage = useMemo(() => KratosFriendlierMessageMapper(t), []);

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

export const KratosUI: FC<KratosUIProps> = ({ resetPasswordComponent, flow, ...rest }) => {
  const { t } = useTranslation();
  const [showFormAlert, setShowFormAlert] = useState(false);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      const button = getActiveElement() as any;
      // do ckeck if only submitting password method
      if (button && button.name === 'method' && button.value === 'password') {
        if (!e.currentTarget.checkValidity()) {
          setShowFormAlert(true);
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
    },
    [showFormAlert]
  );

  type NodeGroups = { default: UiNode[]; oidc: UiNode[]; password: UiNode[]; rest: UiNode[] };

  const nodesByGroup = useMemo(() => {
    if (!flow) return;

    return flow.ui.nodes.reduce(
      (acc, node) => {
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
      { default: [], oidc: [], password: [], rest: [] } as NodeGroups
    );
  }, [flow]);

  if (!nodesByGroup || !flow) return null;

  const ui = flow.ui;

  const initialState: Partial<FormType> = {};

  ui.nodes.forEach((node: UiNode) => {
    const name = getNodeName(node);
    const value = getNodeValue(node);

    const key = name as keyof FormType;
    initialState[key] = value || ('' as any);
  });

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

  console.log(ui.messages);

  return (
    <KratosUIProvider {...rest}>
      {showFormAlert && (
        <Alert severity={'warning'} onClose={() => setShowFormAlert(false)}>
          {t('authentication.validation.fill-fields')}
        </Alert>
      )}
      <form action={ui.action} method={ui.method} noValidate onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item>
            <KratosMessages messages={ui.messages} />
          </Grid>
          {nodesByGroup.default.map(toUiControl)}
          {nodesByGroup.password.map(toUiControl)}
          <Grid item xs={12}>
            {resetPasswordComponent}
          </Grid>
          {nodesByGroup.oidc.length > 0 && <Delimiter>or</Delimiter>}
          {nodesByGroup.oidc.map(toUiControl)}
          {nodesByGroup.rest.map(toUiControl)}
        </Grid>
      </form>
    </KratosUIProvider>
  );
};
export default KratosUI;

interface KratosUIContextProps {
  termsURL?: string;
  privacyURL?: string;
  isHidden: (node: UiNode) => boolean;
}

export const KratosUIContext = React.createContext<KratosUIContextProps>({ isHidden: (_node: UiNode) => false });

interface KratosUIProviderProps {
  termsURL?: string;
  privacyURL?: string;
  hideFields?: string[];
}

export const KratosUIProvider: FC<KratosUIProviderProps> = ({ children, termsURL, privacyURL, hideFields }) => {
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
        termsURL,
        privacyURL,
        isHidden,
      }}
    >
      {children}
    </KratosUIContext.Provider>
  );
};
