import { FC } from 'react';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import References from '../../../shared/components/References/References';
import { InnovationFlowProfileBlockProps } from './InnovationFlowProfileBlock';
import { useTranslation } from 'react-i18next';

interface InnovationFlowProfileViewProps {
  innovationFlow: InnovationFlowProfileBlockProps['innovationFlow'];
}

const InnovationFlowProfileView: FC<InnovationFlowProfileViewProps> = ({ innovationFlow }) => {
  const { t } = useTranslation();
  return (
    <>
      <WrapperMarkdown>{innovationFlow?.profile.description ?? ''}</WrapperMarkdown>
      {/*
      <BlockSectionTitle>{t('common.tags')}</BlockSectionTitle>
      TODO: Tags component removed for this release. tags will come later.
      <TagsComponent
        tags={innovationFlow?.profile.tags?.tags ?? []}
        color="primary"
        gap={gutters(0.5)}
        height={gutters(2.5)}
        canShowAll
      />
      */}
      <BlockSectionTitle>{t('common.references')}</BlockSectionTitle>
      <References references={innovationFlow?.profile.references} compact />
    </>
  );
};

export default InnovationFlowProfileView;
