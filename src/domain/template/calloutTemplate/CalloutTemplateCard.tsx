import React, { FC } from 'react';
import {
  TemplateBase,
  TemplateCardBaseProps,
} from '../../collaboration/templates/CollaborationTemplatesLibrary/TemplateBase';
import { CalloutContributionType, CalloutState, CalloutType } from '../../../core/apollo/generated/graphql-schema';
import CalloutCard from '../../collaboration/callout/calloutCard/CalloutCard';
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
  return (
    <CalloutCard
      callout={template}
      author={innovationPack?.provider}
      loading={loading}
      onClick={onClick}
      footer={<CalloutTemplateCardFooter callout={template} innovationPack={innovationPack} loading={loading} />}
      template
    />
  );
};

export default CalloutTemplateCard;
