import React, { FC } from 'react';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import { PageProps } from '../../../shared/types/PageProps';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useHub } from '../HubContext/useHub';
import HubPageLayout from '../layout/HubPageLayout';
import { HubAboutView } from '../views/HubAboutView';

export interface HubContextPageProps extends PageProps {}

const HubAboutPage: FC<HubContextPageProps> = () => {
  const { hubNameId, displayName } = useHub();

  return (
    <HubPageLayout currentSection={EntityPageSection.About}>
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
            {...rest}
            {...state}
          />
        )}
      </AboutPageContainer>
    </HubPageLayout>
  );
};
export default HubAboutPage;

/*
<HubContextView
  entities={{
    hubId: hubId,
    hubNameId: hubNameId,
    hubDisplayName: displayName,
    hubTagSet: entities.tagset,
    context: entities.context,
  }}
  state={{
    loading: state.loading,
    error: state.error,
  }}
  options={{}}
  actions={{}}
  metrics={entities.metrics}
/>*/
