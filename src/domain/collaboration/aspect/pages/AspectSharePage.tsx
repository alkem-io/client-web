import React, { FC } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { AspectLayout } from '../views/AspectLayoutWithOutlet';
import { AspectDialogSection } from '../views/AspectDialogSection';
import AspectDashboardContainer from '../containers/AspectDashboardContainer/AspectDashboardContainer';
import AspectDashboardView from '../views/AspectDashboardView';

export interface AspectSharePageProps {
  onClose: () => void;
}

const AspectSharePage: FC<AspectSharePageProps> = ({ onClose }) => {
  const { hubNameId = '', challengeNameId, opportunityNameId, aspectNameId = '', calloutNameId = '' } = useUrlParams();

  return (
    <AspectLayout currentSection={AspectDialogSection.Share} onClose={onClose}>
      <AspectDashboardContainer
        hubNameId={hubNameId}
        aspectNameId={aspectNameId}
        challengeNameId={challengeNameId}
        opportunityNameId={opportunityNameId}
        calloutNameId={calloutNameId}
      >
        {({ aspect, messages, commentsId, ...rest }) => (
          <AspectDashboardView
            mode="share"
            banner={aspect?.profile.visual?.uri}
            displayName={aspect?.profile.displayName}
            description={aspect?.profile?.description}
            type={aspect?.type}
            tags={aspect?.profile?.tagset?.tags}
            references={aspect?.profile?.references}
            messages={messages}
            commentId={commentsId}
            {...rest}
          />
        )}
      </AspectDashboardContainer>
    </AspectLayout>
  );
};

export default AspectSharePage;
