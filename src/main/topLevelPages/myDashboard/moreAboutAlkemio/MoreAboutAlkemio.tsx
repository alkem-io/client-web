import { FC, PropsWithChildren } from 'react';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useTranslation } from 'react-i18next';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { gutters } from '../../../../core/ui/grid/utils';
import { Box, Link, Skeleton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import LanguageIcon from '@mui/icons-material/Language';
import { BlockTitle } from '../../../../core/ui/typography';
import { SvgIconComponent } from '@mui/icons-material';
import { useConfig } from '../../../../domain/platform/config/useConfig';
import { times } from 'lodash';

interface MoreAboutAlkemioProps {}

interface FooterItemProps {
  link: string;
  iconComponent: SvgIconComponent;
}

const FooterItem = ({ link, iconComponent: Icon, children }: PropsWithChildren<FooterItemProps>) => {
  return (
    <Link
      href={link}
      target="_blank"
      flexBasis={0}
      flexGrow={1}
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Icon color="primary" sx={{ fontSize: 60, marginBottom: gutters() }} />
      <BlockTitle textAlign="center">{children}</BlockTitle>
    </Link>
  );
};

const LinksSkeleton = () => (
  <>
    {times(4, i => (
      <Skeleton variant="circular" key={i} width={60} height={60} />
    ))}
  </>
);

const MoreAboutAlkemio: FC<MoreAboutAlkemioProps> = () => {
  const { t } = useTranslation();
  const { locations } = useConfig();

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('pages.home.sections.moreAboutAlkemio.title')} />
      <Box display="flex" flexWrap="wrap" justifyContent="space-around">
        {!locations && <LinksSkeleton />}
        {locations && (
          <>
            <FooterItem iconComponent={LanguageIcon} link={locations.foundation}>
              {t('pages.home.sections.moreAboutAlkemio.links.foundation')}
            </FooterItem>
            <FooterItem iconComponent={NewspaperIcon} link={locations.foundation}>
              {t('pages.home.sections.moreAboutAlkemio.links.news')}
            </FooterItem>
            <FooterItem iconComponent={GitHubIcon} link={locations.opensource}>
              {t('pages.home.sections.moreAboutAlkemio.links.github')}
            </FooterItem>
            <FooterItem iconComponent={MailOutlineIcon} link={locations.feedback}>
              {t('pages.home.sections.moreAboutAlkemio.links.contact')}
            </FooterItem>
          </>
        )}
      </Box>
    </PageContentBlock>
  );
};

export default MoreAboutAlkemio;
