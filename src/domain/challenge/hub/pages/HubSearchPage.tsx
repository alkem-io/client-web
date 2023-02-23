import React, { FC } from 'react';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useHub } from '../HubContext/useHub';
import HubPageLayout from '../layout/HubPageLayout';
import { HubAboutView } from '../views/HubAboutView';

const HubSearchPage: FC = () => {
  const { hubNameId, displayName, communityId } = useHub();

  return (
    <HubPageLayout currentSection={EntityPageSection.Search} searchDisabled>
      <AboutPageContainer hubNameId={hubNameId}>
        {({ tagset, context, permissions, ...rest }, state) => (
          <HubAboutView
            name={displayName}
            tagline={context?.tagline}
            tags={tagset?.tags}
            who={context?.who}
            impact={context?.impact}
            background={context?.background}
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

export default HubSearchPage;
