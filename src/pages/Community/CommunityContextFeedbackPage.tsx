import React, { FC, useMemo } from 'react';
import CommunityContextFeedbackContainer from '../../containers/context/feedback/CommunityFeedbackContainer';
import CommunityFeedbackView from '../../views/Challenge/CommunityFeedbackView';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';

const CommunityContextFeedbackPage: FC<PageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'feedback', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <CommunityContextFeedbackContainer>
      {(entities, state, actions) => (
        <CommunityFeedbackView
          entities={{
            questions: entities.templates?.[0]?.questions ?? [],
          }}
          state={{
            loading: state.loading,
            error: state.error,
            isSubmitting: state.isSubmitting,
            submitError: state.submitError,
          }}
          actions={{
            onSubmit: actions.onFeedbackSubmit,
          }}
          options={{}}
        />
      )}
    </CommunityContextFeedbackContainer>
  );
};
export default CommunityContextFeedbackPage;
