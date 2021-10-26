import React, { FC } from 'react';
import Typography from '../../../core/Typography';

interface ProfileDetailProps {
  title: string;
  value?: string;
}

const ProfileDetail: FC<ProfileDetailProps> = ({ title, value }) => {
  if (!value) return null;

  return (
    <>
      <Typography color="primary" weight="boldLight">
        {title}
      </Typography>
      <Typography>{value}</Typography>
    </>
  );
};

export default ProfileDetail;
