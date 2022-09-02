import React, { FC } from 'react';
import { Loading } from '../../../../../core';
import AspectCreationDialogVisualStepContainer, { EntityIds } from './AspectVisualsStepContainer';
import AspectVisualsStepView from './AspectVisualsStepView';

export interface AspectVisualsStepProps extends EntityIds {}

const AspectVisualsStep: FC<EntityIds> = entityIds => {
  return (
    <AspectCreationDialogVisualStepContainer {...entityIds}>
      {({ bannerNarrow, loading }) =>
        loading || !bannerNarrow ? <Loading /> : <AspectVisualsStepView bannerNarrow={bannerNarrow!} />
      }
    </AspectCreationDialogVisualStepContainer>
  );
};

export default AspectVisualsStep;
