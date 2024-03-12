import { FC } from 'react';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { InnovationFlowProfileBlockProps } from './InnovationFlowProfileBlock';

interface InnovationFlowProfileViewProps {
  innovationFlow: InnovationFlowProfileBlockProps['innovationFlow'];
}

const InnovationFlowProfileView: FC<InnovationFlowProfileViewProps> = ({ innovationFlow }) => {
  return (
    <>
      <WrapperMarkdown>{innovationFlow?.profile.description ?? ''}</WrapperMarkdown>
      {/*
      <BlockSectionTitle>{t('common.tags')}</BlockSectionTitle>
      //!!TODO: Add tags to each InnovationFlow profile
      <TagsComponent
        tags={innovationFlow?.profile.tags?.tags ?? []}
        color="primary"
        gap={gutters(0.5)}
        height={gutters(2.5)}
        canShowAll
      />
      */}
      {/*
      TODO: //!! References are removed
      <BlockSectionTitle>{t('common.references')}</BlockSectionTitle>
      <References references={innovationFlow?.profile.references} compact />
      */}
      {/*
      TODO: //!! Visual (bannerNarrow) is also removed?
      */}
    </>
  );
};

export default InnovationFlowProfileView;
