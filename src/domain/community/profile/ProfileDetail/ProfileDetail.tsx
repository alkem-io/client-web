import React, { FC } from 'react';
import WrapperMarkdown from '@core/ui/markdown/WrapperMarkdown';
import { BlockTitle } from '@core/ui/typography';

interface ProfileDetailProps {
  title: string;
  value?: string;
}

const ProfileDetail: FC<ProfileDetailProps> = ({ title, value = '' }) => {
  return (
    <>
      <BlockTitle>{title}</BlockTitle>
      <WrapperMarkdown>{value}</WrapperMarkdown>
    </>
  );
};

export default ProfileDetail;
