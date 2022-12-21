import React from 'react';
import { Button } from '@mui/material';
import ButtonNarrow from '../../../../core/ui/actions/ButtonNarrow';
import ApplicationButton from '../../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import ApplicationButtonContainer from '../../../community/application/containers/ApplicationButtonContainer';
import provideStaticProps from '../../../../core/utils/provideStaticProps';

interface JourneyCardJoinButtonProps {
  challengeId?: string;
  challengeNameId?: string;
  challengeName?: string;
}

const ButtonNarrowOutlined = provideStaticProps(ButtonNarrow, { variant: 'outlined' }, { override: true });

const JourneyCardJoinButton = (props: JourneyCardJoinButtonProps) => {
  return (
    <ApplicationButtonContainer {...props}>
      {({ applicationButtonProps }, { loading }) => {
        if (applicationButtonProps.isMember) {
          return null;
        }

        return (
          <ApplicationButton
            component={ButtonNarrowOutlined as typeof Button}
            {...applicationButtonProps}
            loading={loading}
          />
        );
      }}
    </ApplicationButtonContainer>
  );
};

export default JourneyCardJoinButton;
