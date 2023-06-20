import React, { FC } from 'react';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useSpace } from '../SpaceContext/useSpace';
import SpacePageLayout from '../layout/SpacePageLayout';
import { SpaceAboutView } from '../views/SpaceAboutView';

const SpaceAboutPage: FC = () => {
  const { spaceNameId, profile, communityId } = useSpace();

  return (
    <SpacePageLayout currentSection={EntityPageSection.About}>
      <AboutPageContainer spaceNameId={spaceNameId}>
        {({ tagset, context, permissions, ...rest }, state) => (
          <SpaceAboutView
            name={profile.displayName}
            tagline={profile.tagline}
            tags={tagset?.tags}
            who={context?.who}
            impact={context?.impact}
            background={profile.description}
            vision={context?.vision}
            communityReadAccess={permissions.communityReadAccess}
            spaceNameId={spaceNameId}
            communityId={communityId}
            {...rest}
            {...state}
          />
        )}
      </AboutPageContainer>
    </SpacePageLayout>
  );
};

export default SpaceAboutPage;
