import { Block, Mail, Public } from '@mui/icons-material';
import { Box, Link, SvgIconProps, Typography } from '@mui/material';
import { FC, useMemo } from 'react';
import * as yup from 'yup';
import GitHub from './icons/GitHub';
import LinkedIn from './icons/LinkedIn';
import Twitter from './icons/Twitter';
import BlueSky from '@/domain/shared/components/SocialLinks/icons/BlueSky';
import { SocialNetworkEnum, SocialNetworksSortOrder } from './models/SocialNetworks';

interface SocialLinksProps {
  title?: string;
  items?: SocialLinkItem[];
  iconSize?: SvgIconProps['fontSize'];
}

const getSocialIcon = (type: SocialNetworkEnum, fontSize: SvgIconProps['fontSize'] = 'large') => {
  switch (type) {
    case SocialNetworkEnum.email:
      return <Mail fontSize={fontSize} />;
    case SocialNetworkEnum.github:
      return <GitHub fontSize={fontSize} />;
    case SocialNetworkEnum.linkedin:
      return <LinkedIn fontSize={fontSize} />;
    case SocialNetworkEnum.twitter:
      return <Twitter fontSize={fontSize} />;
    case SocialNetworkEnum.bsky:
      return <BlueSky fontSize={fontSize} />;
    case SocialNetworkEnum.website:
      return <Public fontSize={fontSize} />;
    default:
      return <Block />;
  }
};

const getSocialLinkUrl = (type: SocialNetworkEnum, url: string) => {
  if (type === SocialNetworkEnum.email) {
    if (!url.startsWith('mailto:')) {
      return `mailto:${url.trimStart()}`;
    }
  }
  return url;
};

export interface SocialLinkItem {
  type: SocialNetworkEnum;
  url: string;
}

const schema = yup.string().url();
const schemaEmail = yup.string().email();

export const SocialLinks: FC<SocialLinksProps> = ({ title, items, iconSize }) => {
  const filteredSortedItems = useMemo(
    () =>
      items
        ?.filter(
          link =>
            link.url &&
            (link.type === SocialNetworkEnum.email ? schemaEmail.isValidSync(link.url) : schema.isValidSync(link.url))
        )
        .sort((a, b) => SocialNetworksSortOrder[a.type] - SocialNetworksSortOrder[b.type]) || [],
    [items]
  );

  if (!filteredSortedItems.length) {
    return null;
  }

  return (
    <Box>
      {title && (
        <Typography color="primary.main" fontWeight="bold" fontSize={16}>
          {title}
        </Typography>
      )}

      {filteredSortedItems.map((item, i) => (
        <Link
          key={`icon-${i}`}
          href={getSocialLinkUrl(item.type, item.url)}
          rel="noreferrer"
          aria-label="social-link"
          target="_blank"
        >
          {getSocialIcon(item.type, iconSize)}
        </Link>
      ))}
    </Box>
  );
};

export default SocialLinks;
