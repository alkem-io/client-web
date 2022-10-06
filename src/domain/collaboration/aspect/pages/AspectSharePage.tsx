import React, { FC } from 'react';
import { useUrlParams } from '../../../../hooks';
import { AspectLayout } from '../views/AspectLayoutWithOutlet';
import { AspectDialogSection } from '../views/AspectDialogSection';
import AspectDashboardContainer from '../../../../containers/aspect/AspectDashboardContainer/AspectDashboardContainer';
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
export default AspectSharePage;
