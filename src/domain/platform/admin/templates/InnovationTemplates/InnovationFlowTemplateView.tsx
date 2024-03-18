import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminInnovationFlowTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import WrapperMarkdown from '../../../../../core/ui/markdown/WrapperMarkdown';
import { BlockTitle } from '../../../../../core/ui/typography';
import Gutters from '../../../../../core/ui/grid/Gutters';
import InnovationFlowStates from '../../../../collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';

interface InnovationFlowTemplateViewProps {
  template: AdminInnovationFlowTemplateFragment;
}

const InnovationFlowTemplateView = ({ template }: InnovationFlowTemplateViewProps) => {
  const { t } = useTranslation();
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);

  const {
    profile: { tagset: { tags } = {}, description = '' },
    states,
  } = template;

  return (
    <Gutters>
      <BlockTitle>{t('common.description')}</BlockTitle>
      <WrapperMarkdown>{description}</WrapperMarkdown>
      <BlockTitle>{t('common.tags')}</BlockTitle>
      <TagsComponent tags={tags || []} />
      <BlockTitle>{t('innovation-templates.states.title')}</BlockTitle>
      <InnovationFlowStates
        states={states}
        selectedState={selectedState}
        onSelectState={state => setSelectedState(state.displayName)}
      />
    </Gutters>
  );
};

export default InnovationFlowTemplateView;
