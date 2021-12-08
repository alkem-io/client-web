import { Grid } from '@mui/material';
import { UiNodeInputAttributes } from '@ory/kratos-client';
import React, { FC, useContext } from 'react';
import Button from '../../core/Button';
import { KratosUIContext } from '../KratosUI';
import { getNodeName, getNodeTitle } from './helpers';
import { KratosProps } from './KratosProps';

interface KratosButtonProps extends KratosProps {}

export const KratosButton: FC<KratosButtonProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  const { isHidden } = useContext(KratosUIContext);

  return (
    <Grid item xs={12}>
      {!isHidden(node) && (
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
      )}
    </Grid>
  );
};
export default KratosButton;
