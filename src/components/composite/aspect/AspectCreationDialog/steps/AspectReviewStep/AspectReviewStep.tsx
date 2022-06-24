import React, { FC } from 'react';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../../../../../domain/shared/components/Section/Section';
import TagsComponent from '../../../../../../domain/shared/components/TagsComponent/TagsComponent';
import { AspectCreationType } from '../../AspectCreationDialog';
import Markdown from '../../../../../core/Markdown';

export interface AspectReviewStepProps {
  aspect: AspectCreationType;
}

const AspectReviewStep: FC<AspectReviewStepProps> = ({ aspect }) => {
  const { t } = useTranslation();

  const { displayName, description, tags = [], type } = aspect;

  return (
    <>
      <LabelRow title={t('components.aspect-creation.create-step.type')} spacer={false}>
        {type}
      </LabelRow>
      <LabelRow title={t('common.title')}>{displayName}</LabelRow>
      <LabelRow title={t('components.aspect-creation.create-step.description')}>
        <Typography component={Markdown}>{description}</Typography>
      </LabelRow>
      <LabelRow title={t('common.tags')}>
        <Box marginTop={1}>
          <TagsComponent tags={tags} count={tags.length} />
        </Box>
      </LabelRow>
      <SectionSpacer double />
      <Typography variant={'subtitle2'}>{t('components.aspect-creation.create-step.explanation')}</Typography>
    </>
  );
};
export default AspectReviewStep;

interface LabelRowProps {
  title: string;
  spacer?: boolean;
}

const LabelRow: FC<LabelRowProps> = ({ children, title, spacer = true }) => (
  <>
    {spacer && <SectionSpacer />}
    <Box>
      <Typography sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{title}</Typography>
      {children}
    </Box>
  </>
);
