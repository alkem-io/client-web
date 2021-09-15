import React, { FC } from 'react';
import { PageProps } from '../common';
import CommunityPage from './CommunityPage';

const OpportunityCommunityPage: FC<PageProps> = ({ paths }) => {
  return <CommunityPage permissions={{ edit: false }} paths={paths} />;
};
export default OpportunityCommunityPage;
