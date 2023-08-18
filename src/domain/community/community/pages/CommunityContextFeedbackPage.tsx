import React, { FC, useMemo } from 'react';
import CommunityContextFeedbackContainer from '../../../journey/common/AboutPageContainer/feedback/CommunityFeedbackContainer';
import { PageProps } from '../../../shared/types/PageProps';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';
import CommunityFeedbackView from '../../../journey/challenge/views/CommunityFeedbackView';

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
