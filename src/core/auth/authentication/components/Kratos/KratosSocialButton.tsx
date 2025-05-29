import React, { FC } from 'react';

import MicrosoftIcon from '../AuthProviders/microsoft.svg?react';
import AppleIcon from '../AuthProviders/apple.svg?react';
import LinkedInIcon from '../AuthProviders/linkedin.svg?react';
import GithubIcon from '../AuthProviders/github.svg?react';
import ViduaIcon from '../AuthProviders/vidua.svg?react';

import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { UiNode, UiNodeInputAttributes } from '@ory/kratos-client';
import { useTranslation } from 'react-i18next';
import { AuthActionButtonProps } from '../Button';
import { SvgIconTypeMap, Button, Tooltip } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

interface SocialCustomization {
  icon: FC<React.SVGProps<SVGSVGElement> & { title?: string }> | OverridableComponent<SvgIconTypeMap>;
  label: string;
}

const socialCustomizations: Record<string, SocialCustomization> = {
  linkedin: {
    icon: LinkedInIcon,
    label: 'linkedin',
  },
  microsoft: {
    icon: MicrosoftIcon,
    label: 'microsoft',
  },
  github: {
    icon: GithubIcon,
    label: 'github',
  },
  apple: {
    icon: AppleIcon,
    label: 'apple',
  },
  vidua: {
    icon: ViduaIcon,
    label: 'vidua',
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
    <Tooltip title={label} placement="top" arrow>
      <Button
        variant="contained"
        sx={{
          background: 'white',
          width: '100%',
          paddingY: 1,
          paddingX: 0,
          margin: 0,
          '&.Mui-disabled': {
            opacity: 0.6,
          },
        }}
        name={node.attributes.name}
        type={node.attributes.type as AuthActionButtonProps['type']}
        value={node.attributes.value}
        disabled={node.attributes.disabled || disabled}
      >
        {Icon && <Icon />}
      </Button>
    </Tooltip>
  );
};

export default KratosSocialButton;
