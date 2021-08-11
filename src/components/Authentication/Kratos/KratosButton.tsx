import { Grid } from '@material-ui/core';
import { UiNodeInputAttributes } from '@ory/kratos-client';
import React, { FC } from 'react';
import Button from '../../core/Button';
import { getNodeName, getNodeTitle } from './helpers';
import { KratosProps } from './KratosProps';

interface KratosButtonProps extends KratosProps {}

export const KratosButton: FC<KratosButtonProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  return (
    <Grid item xs={12}>
      <Button
        name={getNodeName(node)}
        text={getNodeTitle(node)}
        variant="primary"
        type={attributes.type}
        disabled={attributes.disabled}
        value={attributes.value}
        block
        small
      />
    </Grid>
  );
};
export default KratosButton;
