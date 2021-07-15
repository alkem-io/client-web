import { UiNode } from '@ory/kratos-client';
import React, { FC } from 'react';
import { Form } from 'react-bootstrap';
import { isInvalidNode } from './helpers';

interface KratosFeedbackProps {
  node: UiNode;
}

export const KratosFeedback: FC<KratosFeedbackProps> = ({ node }) => {
  return isInvalidNode(node) ? (
    <>
      {node.messages.map((x, key) => (
        <Form.Control.Feedback type="invalid" key={key}>
          {x.text}
        </Form.Control.Feedback>
      ))}
    </>
  ) : null;
};
export default KratosFeedback;
