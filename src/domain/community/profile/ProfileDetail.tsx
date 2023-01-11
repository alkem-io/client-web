import React, { FC } from 'react';
import { BlockTitle, Text } from '../../../../core/ui/typography';

interface ProfileDetailProps {
  title: string;
  value?: string;
}

const ProfileDetail: FC<ProfileDetailProps> = ({ title, value }) => {
  return (
    <>
      <BlockTitle>{title}</BlockTitle>
      <Text>{value}</Text>
    </>
  );
};

export default ProfileDetail;
