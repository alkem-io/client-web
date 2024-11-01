import React from 'react';

import * as yup from 'yup';
import i18next from 'i18next';

import MarkdownInput from './MarkdownInput';
import SectionSpacer from '../../../../shared/components/Section/SectionSpacer';

import {
  SMALL_TEXT_LENGTH,
  MARKDOWN_TEXT_LENGTH,
  MarkdownTextMaxLength,
} from '../../../../../core/ui/forms/field-length.constants';
import { JourneyTypeName } from '../../../../journey/JourneyTypeName';
import MarkdownValidator from '../../../../../core/ui/forms/MarkdownInput/MarkdownValidator';

export const contextSegmentSchema = yup.object().shape({
  who: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  tagline: yup.string().max(SMALL_TEXT_LENGTH),
  impact: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  vision: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  background: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
});

const mdConfig = [
  {
    rows: 10,
    name: 'vision',
    label: getLabelAndHelperText,
    maxLength: MARKDOWN_TEXT_LENGTH,
    helperText: getLabelAndHelperText,
  },
  {
    rows: 10,
    name: 'background',
    label: getLabelAndHelperText,
    maxLength: MARKDOWN_TEXT_LENGTH,
    helperText: getLabelAndHelperText,
  },
  {
    rows: 10,
    name: 'impact',
    label: getLabelAndHelperText,
    maxLength: MARKDOWN_TEXT_LENGTH,
    helperText: getLabelAndHelperText,
  },
  {
    rows: 10,
    name: 'who',
    label: getLabelAndHelperText,
    maxLength: MARKDOWN_TEXT_LENGTH,
    helperText: getLabelAndHelperText,
  },
];

export const ContextSegment = ({ loading, contextType }: ContextSegmentProps & { contextType: JourneyTypeName }) =>
  mdConfig.map(({ rows, name, label, maxLength, helperText }, idx: number) => (
    <React.Fragment key={name}>
      <MarkdownInput
        rows={rows}
        name={name}
        loading={loading}
        maxLength={maxLength as MarkdownTextMaxLength}
        label={label('label', contextType, name as Name)}
        helperText={helperText('hText', contextType, name as Name)}
      />

      {idx !== mdConfig.length - 1 && <SectionSpacer />}
    </React.Fragment>
  ));

function getLabelAndHelperText(type: 'label' | 'hText', contextType: JourneyTypeName, name: Name) {
  return type === 'label'
    ? i18next.t(`context.${contextType}.${name}.title` as const)
    : i18next.t(`context.${contextType}.${name}.description` as const);
}

export interface ContextSegmentProps {
  loading?: boolean;
}

type Name = 'who' | 'vision' | 'impact' | 'background';
