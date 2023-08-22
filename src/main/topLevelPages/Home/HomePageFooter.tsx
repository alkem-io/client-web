import React, { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import Icon, { IconProps } from '../../../core/ui/icon/Icon';
import IconLabel from '../../../domain/shared/components/IconLabel';
import PublicIcon from '@mui/icons-material/Public';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkNoUnderline from '../../../domain/shared/components/LinkNoUnderline';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../core/ui/content/PageContentBlockHeader';

interface FooterItemProps {
  link: string;
  iconComponent: IconProps['iconComponent'];
}

const FooterItem = ({ link, iconComponent, children }: PropsWithChildren<FooterItemProps>) => {
  return (
    <Box flexBasis="20%" flexShrink={1}>
      <Box
        component={LinkNoUnderline}
        to={link}
        target="_blank"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Icon iconComponent={iconComponent} color="primary" size="xl" />
        <IconLabel>{children}</IconLabel>
      </Box>
    </Box>
  );
};

const HomePageFooter = () => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('pages.home.sections.footer.headline')} />
      <Box display="flex" flexWrap="wrap" justifyContent="center">
        <FooterItem iconComponent={PublicIcon} link="//alkemio.foundation">
          {t('pages.home.sections.footer.links.foundation')}
        </FooterItem>
        <FooterItem iconComponent={MailOutlineIcon} link="//alkemio.foundation/feedback/">
          {t('pages.home.sections.footer.links.contact-form')}
        </FooterItem>
        <FooterItem iconComponent={GitHubIcon} link="//github.com/alkem-io">
          {t('pages.home.sections.footer.links.github')}
        </FooterItem>
      </Box>
    </PageContentBlock>
  );
};

export default HomePageFooter;
