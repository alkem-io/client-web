import React, { FC } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import AspectDashboardView from '../views/AspectDashboardView';
import AspectDashboardContainer from '../containers/AspectDashboardContainer/AspectDashboardContainer';
import { AspectLayout } from '../views/AspectLayoutWithOutlet';
import { AspectDialogSection } from '../views/AspectDialogSection';

export interface AspectDashboardPageProps {
  onClose: () => void;
}

const AspectDashboardPage: FC<AspectDashboardPageProps> = ({ onClose }) => {
  const { hubNameId = '', challengeNameId, opportunityNameId, aspectNameId = '', calloutNameId = '' } = useUrlParams();

  return (
    <AspectLayout currentSection={AspectDialogSection.Dashboard} onClose={onClose}>
      <AspectDashboardContainer
        hubNameId={hubNameId}
        aspectNameId={aspectNameId}
        challengeNameId={challengeNameId}
        opportunityNameId={opportunityNameId}
        calloutNameId={calloutNameId}
      >
        {({ aspect, messages, commentsId, ...rest }) => (
          <AspectDashboardView
            mode="messages"
            banner={aspect?.banner?.uri}
            displayName={aspect?.profile.displayName}
            description={aspect?.profile.description}
            type={aspect?.type}
            tags={aspect?.profile.tagset?.tags}
            references={aspect?.profile.references}
            messages={messages}
            commentId={commentsId}
            {...rest}
          />
        )}
      </AspectDashboardContainer>
    </AspectLayout>
  );
};

export default AspectDashboardPage;
