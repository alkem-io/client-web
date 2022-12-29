import { Grid } from '@mui/material';
import { UiNodeInputAttributes } from '@ory/kratos-client';
import React, { FC, useContext } from 'react';
import { KratosUIContext } from '../KratosUI';
import { getNodeName, getNodeTitle } from './helpers';
import { KratosProps } from './KratosProps';
import AuthActionButton, { AuthActionButtonProps } from '../Button';

interface KratosButtonProps extends KratosProps {}

export const KratosButton: FC<KratosButtonProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  const { onBeforeSubmit } = useContext(KratosUIContext);

  return (
    <Grid item xs={12}>
      <AuthActionButton
        name={getNodeName(node)}
        type={attributes.type as AuthActionButtonProps['type']}
        disabled={attributes.disabled}
        value={attributes.value}
        onClick={onBeforeSubmit}
      >
        {getNodeTitle(node)}
      </AuthActionButton>
    </Grid>
  );
};

export default KratosButton;
