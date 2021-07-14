import { UiNodeInputAttributes } from '@ory/kratos-client';
import React, { FC, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Required } from '../../Required';
import { getNodeName, getNodeTitle, getNodeValue, isInvalidNode } from './helpers';
import KratosFeedback from './KratosFeedback';
import { KratosProps } from './KratosProps';
import KratosTermsLabel from './KratosTermsLabel';

interface KratosCheckboxProps extends KratosProps {}

const KratosCheckbox: FC<KratosCheckboxProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  const [state, setState] = useState(Boolean(getNodeValue(node)));

  const invalid = isInvalidNode(node);
  const updatedTitle = attributes.name === 'traits.accepted_terms' ? <KratosTermsLabel /> : getNodeTitle(node);

  return (
    <Form.Group controlId={node.group}>
      <Form.Check name={getNodeName(node)} type="checkbox">
        <Form.Check.Input
          type="checkbox"
          name={getNodeName(node)}
          checked={state}
          onChange={() => setState(oldState => !oldState)}
          isInvalid={invalid}
          value={String(state)}
        />
        <Form.Check.Label>
          {updatedTitle}
          {attributes.required && <Required />}
        </Form.Check.Label>
        <KratosFeedback node={node} />
      </Form.Check>
    </Form.Group>
  );
};
export default KratosCheckbox;
