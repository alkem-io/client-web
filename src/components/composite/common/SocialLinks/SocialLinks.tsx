import { Link } from '@material-ui/core';
import { Block, GitHub, LinkedIn, Mail, Twitter } from '@material-ui/icons';
import React, { FC } from 'react';
import { SocialNetworkEnum } from '../../../../models/enums/SocialNetworks';
import Typography from '../../../core/Typography';

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
    default:
      return <Block />;
  }
};

const getSocialLink = (type: SocialNetworkEnum, url: string) => {
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

export const SocialLinks: FC<ContactDetailsProps> = ({ title, items }) => {
  return (
    <>
      <Typography color="primary" weight="boldLight">
        {title}
      </Typography>

      {items?.map((item, i) => (
        <Link key={i} href={getSocialLink(item.type, item.url)} rel="noreferrer" tabIndex={0}>
          {getSocialIcon(item.type)}
        </Link>
      ))}
    </>
  );
};

export default SocialLinks;
