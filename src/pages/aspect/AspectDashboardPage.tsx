import React, { FC } from 'react';
import { useUrlParams } from '../../hooks';
import AspectDashboardView from '../../views/aspect/AspectDashboardView';
import AspectDashboardContainer from '../../containers/aspect/AspectDashboardContainer/AspectDashboardContainer';
import AspectLayout from '../../domain/aspect/views/AspectLayoutWithOutlet';
import { AspectDialogSection } from '../../domain/aspect/views/AspectDialogSection';

export interface AspectDashboardPageProps {
  onClose: () => void;
}

const AspectDashboardPage: FC<AspectDashboardPageProps> = ({ onClose }) => {
  const { hubNameId = '', challengeNameId, opportunityNameId, aspectNameId = '' } = useUrlParams();

  return (
    <AspectLayout currentSection={AspectDialogSection.Dashboard} onClose={onClose}>
      <AspectDashboardContainer
        hubNameId={hubNameId}
        aspectNameId={aspectNameId}
        challengeNameId={challengeNameId}
        opportunityNameId={opportunityNameId}
      >
        {({ aspect, messages, commentId, ...rest }) => (
          <AspectDashboardView
            banner={aspect?.banner?.uri}
            displayName={aspect?.displayName}
            description={aspect?.description}
            type={aspect?.type}
            tags={aspect?.tagset?.tags}
            references={aspect?.references}
            messages={messages}
            commentId={commentId}
            {...rest}
          />
        )}
      </AspectDashboardContainer>
    </AspectLayout>
  );
};
export default AspectDashboardPage;
