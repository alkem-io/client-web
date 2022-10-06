import React, { FC } from 'react';
import { useUrlParams } from '../../../../hooks';
import { AspectLayout } from '../views/AspectLayoutWithOutlet';
import { AspectDialogSection } from '../views/AspectDialogSection';
import { ShareComponent, ShareComponentTitle } from '../../../shared/components/ShareDialog/ShareComponent';
import { buildAspectUrl } from '../../../../common/utils/urlBuilders';

export interface AspectSharePageProps {
  onClose: () => void;
}

const AspectSharePage: FC<AspectSharePageProps> = ({ onClose }) => {
  const { hubNameId = '', challengeNameId, opportunityNameId, aspectNameId = '', calloutNameId = '' } = useUrlParams();

  return (
    <AspectLayout currentSection={AspectDialogSection.Share} onClose={onClose}>
      <ShareComponentTitle entityTypeName="card" />
      <ShareComponent
        url={buildAspectUrl({ hubNameId, challengeNameId, opportunityNameId, calloutNameId, aspectNameId })}
      />
    </AspectLayout>
  );
};
export default AspectSharePage;
