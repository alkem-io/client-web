import { Box, Button, type SvgIconTypeMap, Tooltip } from '@mui/material';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { UiNode, UiNodeInputAttributes } from '@ory/kratos-client';
import type React from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import { socialProviderCustomizations } from '../../socialProviderCustomizations';
import AppleIcon from '../AuthProviders/apple.svg?react';
import CleverbaseIcon from '../AuthProviders/cleverbase.svg?react';
import GithubIcon from '../AuthProviders/github.svg?react';
import LinkedInIcon from '../AuthProviders/linkedin.svg?react';
import MicrosoftIcon from '../AuthProviders/microsoft.svg?react';
import type { AuthActionButtonProps } from '../Button';

interface SocialCustomization {
  icon: FC<React.SVGProps<SVGSVGElement> & { title?: string }> | OverridableComponent<SvgIconTypeMap>;
  sortOrder: number;
}

// Icon components are MUI-layer specific; provider ordering is sourced from the
// framework-agnostic `socialProviderCustomizations` so the MUI and CRD auth
// layers never disagree on the order providers are shown in.
export const socialCustomizations: Record<string, SocialCustomization> = {
  linkedin: { icon: LinkedInIcon, sortOrder: socialProviderCustomizations.linkedin.sortOrder },
  microsoft: { icon: MicrosoftIcon, sortOrder: socialProviderCustomizations.microsoft.sortOrder },
  github: { icon: GithubIcon, sortOrder: socialProviderCustomizations.github.sortOrder },
  apple: { icon: AppleIcon, sortOrder: socialProviderCustomizations.apple.sortOrder },
  cleverbase: { icon: CleverbaseIcon, sortOrder: socialProviderCustomizations.cleverbase.sortOrder },
};

interface KratosSocialButtonProps {
  node: UiNode & { attributes: UiNodeInputAttributes };
  disabled?: boolean;
}

const KratosSocialButton = ({ node, disabled = false }: KratosSocialButtonProps) => {
  const { t, i18n } = useTranslation();

  const Icon = socialCustomizations[node.attributes.value]?.icon;

  const label = i18n.exists(`authentication.social-login.providers.${node.attributes.value}`)
    ? t('authentication.social-login.connect', {
        provider: t(`authentication.social-login.providers.${node.attributes.value}` as TranslationKey),
      })
    : node.meta.label?.text;

  return (
    <Box
      sx={{
        height: 55,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Tooltip title={label} placement="top" arrow={true}>
        <Button
          variant="contained"
          sx={{
            background: theme => theme.palette.background.paper,
            padding: 0,
            height: '100%',
            margin: 0,
            '&.Mui-disabled': {
              opacity: 0.6,
            },
          }}
          name={node.attributes.name}
          type={(node.attributes.type || 'button') as AuthActionButtonProps['type']}
          value={node.attributes.value}
          disabled={node.attributes.disabled || disabled}
        >
          {Icon ? <Icon /> : node.meta.label?.text}
        </Button>
      </Tooltip>
    </Box>
  );
};

export default KratosSocialButton;
