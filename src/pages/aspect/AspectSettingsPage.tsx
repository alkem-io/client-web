import React, { FC, useMemo } from 'react';
import { useResolvedPath } from 'react-router-dom';
import { useUpdateNavigation, useUrlParams } from '../../hooks';
import { PageProps } from '../common';
import AspectSettingsContainer from '../../containers/aspect/AspectSettingsContainer/AspectSettingsContainer';

export interface AspectSettingsPageProps extends PageProps {}

const AspectSettingsPage: FC<AspectSettingsPageProps> = ({ paths: _paths }) => {
  const { ecoverseNameId = '', challengeNameId, opportunityNameId, aspectNameId = '' } = useUrlParams();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(() => [..._paths, { value: '', name: 'Settings', real: false }], [_paths, resolved]);
  useUpdateNavigation({ currentPaths });

  return (
    <AspectSettingsContainer
      hubNameId={ecoverseNameId}
      aspectNameId={aspectNameId}
      challengeNameId={challengeNameId}
      opportunityNameId={opportunityNameId}
    >
      {(entities, state, actions) => <>{console.log(entities, state, actions)}</>}
    </AspectSettingsContainer>
  );
};
export default AspectSettingsPage;
