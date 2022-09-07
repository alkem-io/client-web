import React, { FC } from 'react';
import { useUrlParams } from '../../../hooks';
import AspectDashboardView from '../views/AspectDashboardView';
import AspectDashboardContainer from '../../../containers/aspect/AspectDashboardContainer/AspectDashboardContainer';
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
            banner={aspect?.banner?.uri}
            displayName={aspect?.displayName}
            description={aspect?.description}
            type={aspect?.type}
            tags={aspect?.tagset?.tags}
            references={aspect?.references}
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
