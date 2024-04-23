import React from 'react';
import CommunityContextFeedbackContainer from '../../../journey/common/AboutPageContainer/feedback/CommunityFeedbackContainer';
import CommunityFeedbackView from '../../../journey/challenge/views/CommunityFeedbackView';

const CommunityContextFeedbackPage = () => {
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
