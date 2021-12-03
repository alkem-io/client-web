import { Link } from '@mui/material';
import { Block, Mail, Public } from '@mui/icons-material';
import React, { FC } from 'react';
import { SocialNetworkEnum, SocianNetworksSortOrder } from '../../../../models/enums/SocialNetworks';
import Typography from '../../../core/Typography';
import GitHub from '../../../core/icons/GitHub';
import LinkedIn from '../../../core/icons/LinkedIn';
import Twitter from '../../../core/icons/Twitter';

interface ContactDetailsProps {
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

export const SocialLinks: FC<ContactDetailsProps> = ({ title, items }) => {
  return (
    <>
      <Typography color="primary" weight="boldLight">
        {title}
      </Typography>

      {items
        ?.sort((a, b) => SocianNetworksSortOrder[a.type] - SocianNetworksSortOrder[b.type])
        .map((item, i) => (
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
  );
};

export default SocialLinks;
