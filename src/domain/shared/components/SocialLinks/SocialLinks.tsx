import { Link } from '@mui/material';
import { Block, Mail, Public } from '@mui/icons-material';
import React, { FC, useMemo } from 'react';
import { SocialNetworkEnum, SocianNetworksSortOrder } from './models/SocialNetworks';
import Typography from '../../../../common/components/core/Typography';
import GitHub from './icons/GitHub';
import LinkedIn from './icons/LinkedIn';
import Twitter from './icons/Twitter';
import * as yup from 'yup';
interface SocialLinksProps {
  title: string;
  items?: SocialLinkItem[];
}

const getSocialIcon = (type: SocialNetworkEnum) => {
  const fontSize = 'large';

  switch (type) {
    case SocialNetworkEnum.email:
      return <Mail fontSize={fontSize} />;
    case SocialNetworkEnum.github:
      return <GitHub fontSize={fontSize} />;
    case SocialNetworkEnum.linkedin:
      return <LinkedIn fontSize={fontSize} />;
    case SocialNetworkEnum.twitter:
      return <Twitter fontSize={fontSize} />;
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

export const isSocialLink = (item: { type?: string; url: string }): item is SocialLinkItem => !!item?.type;

export interface SocialLinkItem {
  type: SocialNetworkEnum;
  url: string;
}

const schema = yup.string().url();

export const SocialLinks: FC<SocialLinksProps> = ({ title, items }) => {
  const filteredSortedItems = useMemo(
    () =>
      items
        ?.filter(i => schema.isValidSync(i.url) && i.url)
        .sort((a, b) => SocianNetworksSortOrder[a.type] - SocianNetworksSortOrder[b.type]) || [],
    [items]
  );
  return filteredSortedItems && filteredSortedItems.length > 0 ? (
    <>
      <Typography color="primary" weight="boldLight">
        {title}
      </Typography>

      {filteredSortedItems.map((item, i) => (
        <Link
          key={i}
          href={getSocialLinkUrl(item.type, item.url)}
          rel="noreferrer"
          tabIndex={0}
          aria-label="social-link"
        >
          {getSocialIcon(item.type)}
        </Link>
      ))}
    </>
  ) : (
    <></>
  );
};

export default SocialLinks;
