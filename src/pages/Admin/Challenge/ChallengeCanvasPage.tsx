import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useUpdateNavigation } from '../../../hooks';
import ChallengePageContainer from '../../../containers/challenge/ChallengePageContainer';
import ChallengeCanvasManagementView from '../../../views/Challenge/ChallengeCanvasManagementView';
import PageLayout from '../../../domain/shared/layout/PageLayout';
import { EntityPageSection } from '../../../domain/shared/layout/EntityPageSection';

export interface ChallengeCanvasPageProps extends PageProps {}

const ChallengeCanvasPage: FC<ChallengeCanvasPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/canvases', name: 'canvases', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <PageLayout currentSection={EntityPageSection.Canvases} entityTypeName="challenge">
      <ChallengePageContainer>
        {(entities, state) => {
          if (!entities.challenge) {
            return <></>;
          }

          return (
            <ChallengeCanvasManagementView
              entities={{ challenge: entities.challenge }}
              state={{ loading: state.loading, error: state.error }}
              actions={undefined}
              options={undefined}
            />
          );
        }}
      </ChallengePageContainer>
    </PageLayout>
  );
};
export default ChallengeCanvasPage;
