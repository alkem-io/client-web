import React, { FC } from 'react';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useHub } from '../HubContext/useHub';
import HubPageLayout from '../layout/HubPageLayout';
import { HubAboutView } from '../views/HubAboutView';

const HubAboutPage: FC = () => {
  const { hubNameId, profile, communityId } = useHub();

  return (
    <HubPageLayout currentSection={EntityPageSection.About}>
      <AboutPageContainer hubNameId={hubNameId}>
        {({ tagset, context, permissions, ...rest }, state) => (
          <HubAboutView
            name={profile.displayName}
            tagline={profile.tagline}
            tags={tagset?.tags}
            who={context?.who}
            impact={context?.impact}
            background={profile.description}
            vision={context?.vision}
            communityReadAccess={permissions.communityReadAccess}
            hubNameId={hubNameId}
            communityId={communityId}
            {...rest}
            {...state}
          />
        )}
      </AboutPageContainer>
    </HubPageLayout>
  );
};

export default HubAboutPage;
