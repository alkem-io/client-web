import React, { FC, useMemo } from 'react';
import { UserMetadata } from '../../hooks/useUserMetadataWrapper';
import User from '../layout/User';

interface UserSegmentProps {
  orientation: 'vertical' | 'horizontal';
  userMetadata: UserMetadata;
}

const UserSegment: FC<UserSegmentProps> = ({ orientation, userMetadata }) => {
  const { user, roles } = userMetadata;
  const role = useMemo(() => {
    return roles.filter(r => !r.hidden)[0]?.name;
  }, [userMetadata]);
  return (
    user && (
      <User name={user.displayName} title={role} orientation={orientation} src={user.profile?.avatar} reverseLayout />
    )
  );
};

export default UserSegment;
