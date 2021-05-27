import {
  LoginFlow,
  RegistrationFlow,
  SettingsFlow,
  SubmitSelfServiceLoginFlow,
  SubmitSelfServiceRegistrationFlow,
  SubmitSelfServiceSettingsFlow,
  UiNode,
  UiNodeInputAttributes,
  UiText,
} from '@ory/kratos-client';
import React, { FC } from 'react';
import { Alert, Form } from 'react-bootstrap';
import Button from '../core/Button';
import { getNodeName, getNodeTitle, getNodeValue } from './Kratos/helpers';

interface KratosUIProps {
  flow?: LoginFlow | RegistrationFlow | SettingsFlow;
}

const toAlertVariant = (type: string) => {
  switch (type) {
    case 'error':
      return 'danger';
    default:
      return 'primary';
  }
};

interface KratosProps {
  node: UiNode;
}

const KratosHidden: FC<KratosProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  return <Form.Control type={'hidden'} value={attributes.value as string} name={attributes.name} />;
};

const KratosButton: FC<KratosProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  return (
    <Button
      name={attributes.name}
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

const KratosInput: FC<KratosProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  return (
    <Form.Group controlId={node.group}>
      <Form.Label>
        {getNodeTitle(node)}
        {attributes.required && <span style={{ color: '#d93636' }}>{' *'}</span>}
      </Form.Label>
      <Form.Control
        type={attributes.type}
        value={attributes.value as string}
        name={attributes.name}
        required={attributes.required}
        disabled={attributes.disabled}
      />
      <KratosMessages messages={node?.messages} />
    </Form.Group>
  );
};

const KratosCheckbox: FC<KratosProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  return (
    <Form.Group controlId={node.group}>
      <Form.Check
        type={'checkbox'}
        label={getNodeTitle(node)}
        value={attributes.value as string}
        required={attributes.required}
        disabled={attributes.disabled}
      />
      <KratosMessages messages={node?.messages} />
    </Form.Group>
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
  switch (node.type) {
    case 'input':
      const attributes = node.attributes as UiNodeInputAttributes;
      switch (attributes.type) {
        case 'hidden':
          return <KratosHidden key={key} node={node} />;
        case 'submit':
          return <KratosButton key={key} node={node} />;
        case 'checkbox':
          return <KratosCheckbox key={key} node={node} />;
        default:
          return <KratosInput key={key} node={node} />;
      }
    default:
      return <KratosInput key={key} node={node} />;
  }
};

type FormType = SubmitSelfServiceSettingsFlow | SubmitSelfServiceLoginFlow | SubmitSelfServiceRegistrationFlow;

export const KratosUI: FC<KratosUIProps> = ({ flow }) => {
  const nodes = flow?.ui.nodes || [];
  const initialState: Partial<FormType> = {};

  nodes.forEach((node: UiNode) => {
    const name = getNodeName(node);
    const value = getNodeValue(node);

    const key = name as keyof FormType;
    initialState[key] = value || ('' as any);
  });

  if (!flow) return null;
  const ui = flow.ui;

  return (
    <>
      <KratosMessages messages={ui.messages} />
      {/* <Formik initialValues={initialState} enableReinitialize onSubmit={values => console.log(values)}>
        {({ values }) => {
          return ( */}
      <Form action={ui.action} method={ui.method}>
        {ui.nodes.map(toUiControl)}
      </Form>
      {/* ); */}
      {/* }}
      </Formik> */}
    </>
  );
};
export default KratosUI;
