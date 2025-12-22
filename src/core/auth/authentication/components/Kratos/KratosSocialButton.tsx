import React, { FC } from 'react';

import MicrosoftIcon from '../AuthProviders/microsoft.svg?react';
import AppleIcon from '../AuthProviders/apple.svg?react';
import LinkedInIcon from '../AuthProviders/linkedin.svg?react';
import GithubIcon from '../AuthProviders/github.svg?react';
import CleverbaseIcon from '../AuthProviders/cleverbase.svg?react';

import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { UiNode, UiNodeInputAttributes } from '@ory/kratos-client';
import { useTranslation } from 'react-i18next';
import { AuthActionButtonProps } from '../Button';
import { SvgIconTypeMap, Button, Tooltip, Box } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

interface SocialCustomization {
  icon: FC<React.SVGProps<SVGSVGElement> & { title?: string }> | OverridableComponent<SvgIconTypeMap>;
  label: string;
  sortOrder: number;
}

export const socialCustomizations: Record<string, SocialCustomization> = {
  linkedin: {
    icon: LinkedInIcon,
    label: 'linkedin',
    sortOrder: 2,
  },
  microsoft: {
    icon: MicrosoftIcon,
    label: 'microsoft',
    sortOrder: 1,
  },
  github: {
    icon: GithubIcon,
    label: 'github',
    sortOrder: 4,
  },
  apple: {
    icon: AppleIcon,
    label: 'apple',
    sortOrder: 3,
  },
  cleverbase: {
    icon: CleverbaseIcon,
    label: 'cleverbase',
    sortOrder: 5,
  },
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
      <Tooltip title={label} placement="top" arrow>
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
