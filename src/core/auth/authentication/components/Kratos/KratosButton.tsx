import { Box, type ButtonProps, GridLegacy, type SxProps, type Theme, Tooltip } from '@mui/material';
import type { UiNodeInputAttributes } from '@ory/kratos-client';
import { type FC, type ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import AuthActionButton, { type AuthActionButtonProps } from '../Button';
import { KratosUIContext } from '../KratosUI';
import { getNodeName, getNodeTitle } from './helpers';
import type { KratosProps } from './KratosProps';

interface KratosButtonProps extends KratosProps {
  variant?: ButtonProps['variant'];
  disabled?: boolean;
  sx?: SxProps<Theme>;
  startIcon?: ReactNode;
}

export const KratosButton: FC<KratosButtonProps> = ({ disabled, node, sx, variant = 'contained', startIcon }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  const { onBeforeSubmit } = useContext(KratosUIContext);
  const { t } = useTranslation();

  return (
    <GridLegacy item={true} xs={12}>
      <Tooltip
        title={t('pages.accept-terms.tooltip')}
        disableFocusListener={!disabled}
        disableHoverListener={!disabled}
        arrow={true}
        placement="top"
      >
        <Box>
          <AuthActionButton
            name={getNodeName(node)}
            type={attributes.type as AuthActionButtonProps['type']}
            disabled={attributes.disabled || !!disabled}
            value={attributes.value}
            onClick={onBeforeSubmit}
            variant={variant}
            sx={sx}
            startIcon={startIcon}
          >
            {getNodeTitle(node, t)}
          </AuthActionButton>
        </Box>
      </Tooltip>
    </GridLegacy>
  );
};

export default KratosButton;
