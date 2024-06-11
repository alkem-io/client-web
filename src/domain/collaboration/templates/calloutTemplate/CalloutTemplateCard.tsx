import React, { FC } from 'react';
import { TemplateBase, TemplateCardBaseProps } from '../CollaborationTemplatesLibrary/TemplateBase';
import { CalloutContributionType, CalloutState, CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import CalloutCard from '../../callout/calloutCard/CalloutCard';
import CalloutTemplateCardFooter from './CalloutTemplateCardFooter';

export interface CalloutTemplate extends TemplateBase {
  contributionPolicy: {
    allowedContributionTypes: CalloutContributionType[];
    state: CalloutState;
  };
  type: CalloutType;
}

interface CalloutTemplateCardProps extends TemplateCardBaseProps<CalloutTemplate> {}

const CalloutTemplateCard: FC<CalloutTemplateCardProps> = ({ template, innovationPack, loading, onClick }) => {
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
      footer={<CalloutTemplateCardFooter callout={template} innovationPack={innovationPack} loading={loading} />}
      template
    />
  );
};

export default CalloutTemplateCard;
