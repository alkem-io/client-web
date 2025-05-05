import React, { ComponentType, FC } from 'react';
import linkedInTheme from '../AuthProviders/LinkedInTheme';
import LinkedInIcon from '../AuthProviders/LinkedIn.svg?react';
import microsoftTheme from '../AuthProviders/MicrosoftTheme';
import MicrosoftIcon from '../AuthProviders/Microsoft.svg?react';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import ButtonStyling from '../AuthProviders/ButtonStyling';
import { useTranslation } from 'react-i18next';
import { AuthActionButtonProps } from '../Button';
import { UiNode, UiNodeInputAttributes } from '@ory/kratos-client';

interface SocialCustomization {
  icon: FC<React.SVGProps<SVGSVGElement> & { title?: string }>;
  theme: { palette: { primary: { main: string } } };
  label: string;
}

const socialCustomizations: Record<string, SocialCustomization> = {
  linkedin: {
    theme: linkedInTheme,
    icon: LinkedInIcon,
    label: 'linkedin',
  },
  microsoft: {
    theme: microsoftTheme,
    icon: MicrosoftIcon,
    label: 'microsoft',
  },
};

interface KratosSocialButtonProps {
  node: UiNode & { attributes: UiNodeInputAttributes };
  buttonComponent: ComponentType<AuthActionButtonProps>;
}

const KratosSocialButton = ({ node, buttonComponent: Button }: KratosSocialButtonProps) => {
  const { t, i18n } = useTranslation();

  const Icon = socialCustomizations[node.attributes.value]?.icon;

  const label = i18n.exists(`authentication.social-login.providers.${node.attributes.value}`)
    ? t('authentication.social-login.connect', {
        provider: t(`authentication.social-login.providers.${node.attributes.value}` as TranslationKey),
      })
    : node.meta.label?.text;

  return (
    <ButtonStyling
      styles={socialCustomizations[node.attributes.value]?.theme}
      icon={Icon && <Icon />}
      component={Button}
      justifyContent="start"
      name={node.attributes.name}
      type={node.attributes.type as AuthActionButtonProps['type']}
      value={node.attributes.value}
    >
      {label}
    </ButtonStyling>
  );
};

export default KratosSocialButton;
