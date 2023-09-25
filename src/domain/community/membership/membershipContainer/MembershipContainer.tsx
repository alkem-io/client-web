import {
  ApplicationButtonContainer,
  ApplicationButtonContainerProps,
} from '../../application/containers/ApplicationButtonContainer';
import React, { ReactNode } from 'react';

interface MembershipContainerProps extends Omit<ApplicationButtonContainerProps, 'children'> {
  children: ({ isMember: boolean }) => ReactNode;
}

const MembershipContainer = ({ children, ...props }: MembershipContainerProps) => {
  return (
    <ApplicationButtonContainer {...props}>
      {({ applicationButtonProps }) => children(applicationButtonProps)}
    </ApplicationButtonContainer>
  );
};

export default MembershipContainer;
