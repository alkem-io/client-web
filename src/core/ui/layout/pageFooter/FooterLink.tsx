import React from 'react';
import { Link, LinkProps } from '@mui/material';
import { Caption } from '../../typography';

interface FooterLinkProps extends LinkProps {}

const FooterLink = (props: FooterLinkProps) => <Caption component={Link} {...props} />;

export default FooterLink;
