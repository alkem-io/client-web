import React, { FC } from 'react';
import CalloutTemplateCardFooterX from './CalloutTemplateCardFooterX';
import { TemplateBase, TemplateCardBaseProps } from '../../library/CollaborationTemplatesLibrary/TemplateBase';
import { CalloutContributionType, CalloutState, CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import CalloutCard from '../../../collaboration/callout/calloutCard/CalloutCard';

export interface CalloutTemplateX extends TemplateBase {
  contributionPolicy: {
    allowedContributionTypes: CalloutContributionType[];
    state: CalloutState;
  };
  type: CalloutType;
}

interface CalloutTemplateCardXProps extends TemplateCardBaseProps<CalloutTemplateX> {}

const CalloutTemplateCardX: FC<CalloutTemplateCardXProps> = ({ template, innovationPack, loading, onClick }) => {
  if (!template) return null;

  return (
    <CalloutCard
      callout={{
        // In this case we map the template profile to the callout.framing.profile
        // to reuse CalloutCard and show the description and displayName
        // of the template in the card as if it was the description of the callout
        ...template,
        framing: {
          profile: template.profile,
        },
      }}
      author={innovationPack?.provider}
      loading={loading}
      onClick={onClick}
      footer={<CalloutTemplateCardFooterX callout={template} innovationPack={innovationPack} loading={loading} />}
      template
    />
  );
};

export default CalloutTemplateCardX;
