import { ButtonProps, Grid } from '@mui/material';
import { UiNodeInputAttributes } from '@ory/kratos-client';
import { FC, useContext } from 'react';
import { KratosUIContext } from '../KratosUI';
import { getNodeName, getNodeTitle } from './helpers';
import { KratosProps } from './KratosProps';
import AuthActionButton, { AuthActionButtonProps } from '../Button';
import { useTranslation } from 'react-i18next';

interface KratosButtonProps extends KratosProps {
  variant?: ButtonProps['variant'];
}

export const KratosButton: FC<KratosButtonProps> = ({ node, variant = 'contained' }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  const { onBeforeSubmit } = useContext(KratosUIContext);
  const { t } = useTranslation();

  return (
    <Grid item xs={12}>
      <AuthActionButton
        name={getNodeName(node)}
        type={attributes.type as AuthActionButtonProps['type']}
        disabled={attributes.disabled}
        value={attributes.value}
        onClick={onBeforeSubmit}
        variant={variant}
      >
        {getNodeTitle(node, t)}
      </AuthActionButton>
    </Grid>
  );
};

export default KratosButton;
