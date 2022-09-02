import { FormHelperText } from '@mui/material';
import { UiNode } from '@ory/kratos-client';
import React, { FC } from 'react';
import { isInvalidNode } from './helpers';

interface KratosFeedbackProps {
  node: UiNode;
}

export const KratosFeedback: FC<KratosFeedbackProps> = ({ node }) => {
  return isInvalidNode(node) ? (
    <>
      {node.messages.map((x, key) => (
        <FormHelperText key={key}>{x.text}</FormHelperText>
      ))}
    </>
  ) : null;
};
export default KratosFeedback;
