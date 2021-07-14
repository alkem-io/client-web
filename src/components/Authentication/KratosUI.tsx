import {
  LoginFlow,
  RecoveryFlow,
  RegistrationFlow,
  SettingsFlow,
  SubmitSelfServiceLoginFlow,
  SubmitSelfServiceRecoveryFlowWithLinkMethod,
  SubmitSelfServiceRegistrationFlow,
  SubmitSelfServiceSettingsFlow,
  SubmitSelfServiceVerificationFlowWithLinkMethod,
  UiNode,
  UiNodeInputAttributes,
  UiText,
  VerificationFlow,
} from '@ory/kratos-client';
import React, { FC, FormEvent, useCallback, useMemo, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Button from '../core/Button';
import Delimiter from '../core/Delimiter';
import { getNodeName, getNodeTitle, getNodeValue, guessVariant, isUiNodeInputAttributes } from './Kratos/helpers';
import KratosCheckbox from './Kratos/KratosCheckbox';
import KratosInput from './Kratos/KratosInput';
import { KratosInputExtraProps, KratosProps } from './Kratos/KratosProps';

type FormType =
  | SubmitSelfServiceSettingsFlow
  | SubmitSelfServiceLoginFlow
  | SubmitSelfServiceRegistrationFlow
  | SubmitSelfServiceVerificationFlowWithLinkMethod
  | SubmitSelfServiceRecoveryFlowWithLinkMethod;
interface KratosUIProps {
  flow?: LoginFlow | RegistrationFlow | SettingsFlow | VerificationFlow | RecoveryFlow;
  termsURL?: string;
  privacyURL?: string;
  resetPasswordComponent?: React.ReactChild;
}

const toAlertVariant = (type: string) => {
  if (type === 'error') {
    return 'danger';
  } else {
    return 'primary';
  }
};

const KratosHidden: FC<KratosProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  return <Form.Control type={'hidden'} value={attributes.value as string} name={attributes.name} />;
};

const KratosButton: FC<KratosProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  return (
    <Button
      name={getNodeName(node)}
      variant="primary"
      type={attributes.type}
      disabled={attributes.disabled}
      value={attributes.value}
      block
      small
    >
      {getNodeTitle(node)}
    </Button>
  );
};

const KratosMessages: FC<{ messages?: Array<UiText> }> = ({ messages }) => {
  return (
    <>
      {messages?.map(x => (
        <Alert key={x.id} variant={toAlertVariant(x.type)}>
          {x.text}
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
      e.preventDefault();
      e.stopPropagation();
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

  return (
    <KratosUIProvider {...rest}>
      <div>
        <Alert show={showFormAlert} variant={'warning'} onClose={() => setShowFormAlert(false)}>
          {t('authentication.validation.fill-fields')}
        </Alert>
        <KratosMessages messages={ui.messages} />
        <Form action={ui.action} method={ui.method} noValidate onSubmit={handleSubmit}>
          {nodesByGroup.default.map(toUiControl)}
          {nodesByGroup.password.map(toUiControl)}
          {resetPasswordComponent}
          {nodesByGroup.oidc.length > 0 && <Delimiter>or</Delimiter>}
          {nodesByGroup.oidc.map(toUiControl)}
          {nodesByGroup.rest.map(toUiControl)}
        </Form>
      </div>
    </KratosUIProvider>
  );
};
export default KratosUI;

interface KratosUIContextProps {
  termsURL?: string;
  privacyURL?: string;
}

export const KratosUIContext = React.createContext<KratosUIContextProps>({});

interface KratosUIProviderProps {
  termsURL?: string;
  privacyURL?: string;
}

export const KratosUIProvider: FC<KratosUIProviderProps> = ({ children, termsURL, privacyURL }) => {
  return (
    <KratosUIContext.Provider
      value={{
        termsURL,
        privacyURL,
      }}
    >
      {children}
    </KratosUIContext.Provider>
  );
};
