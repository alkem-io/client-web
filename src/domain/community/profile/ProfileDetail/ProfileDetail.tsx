import React, { FC } from 'react';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';

interface ProfileDetailProps {
  title: string;
  value?: string;
}

const ProfileDetail: FC<ProfileDetailProps> = ({ title, value, ...rest }) => {
  return (
    <>
      <WrapperTypography color="primary" weight="boldLight" {...rest}>
        {title}
      </WrapperTypography>
      <WrapperTypography>{value}</WrapperTypography>
    </>
  );
};

export default ProfileDetail;
