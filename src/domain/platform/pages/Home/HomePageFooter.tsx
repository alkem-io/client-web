import React, { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import Section, { SectionSpacer } from '../../../shared/components/Section/Section';
import { Box, Typography } from '@mui/material';
import Icon, { IconProps } from '../../../../core/ui/icon/Icon';
import IconLabel from '../../../shared/components/IconLabel';
import PublicIcon from '@mui/icons-material/Public';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkNoUnderline from '../../../shared/components/LinkNoUnderline';

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
    <Section>
      <Typography variant="h4" fontWeight="bold" fontSize="1.1rem" textAlign="center">
        {t('pages.home.sections.footer.headline')}
      </Typography>
      <SectionSpacer double />
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
    </Section>
  );
};

export default HomePageFooter;
