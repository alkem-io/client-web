import {
  CalloutAllowedActors,
  CalloutContributionType,
  CalloutFramingType,
  CalloutVisibility,
  PollResultsDetail,
  PollResultsVisibility,
} from '@/core/apollo/generated/graphql-schema';
import * as yup from 'yup';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import { urlValidator } from '@/core/ui/forms/validator/urlValidator';
import { referenceSegmentSchema } from '@/domain/platformAdmin/components/Common/ReferenceSegment';
import { tagsetsSegmentSchema } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { MAX_POLL_OPTIONS, MIN_POLL_OPTIONS } from '../../poll/PollFormFields';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';

export const calloutValidationSchema = yup.object().shape({
  framing: yup.object().shape({
    profile: yup.object().shape({
      id: textLengthValidator(),
      displayName: displayNameValidator({ required: true }),
      description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).nullable(),
      tagsets: tagsetsSegmentSchema,
      references: referenceSegmentSchema,
    }),
    type: yup
      .mixed<CalloutFramingType>()
      .oneOf(Object.values(CalloutFramingType).filter(value => typeof value === 'string'))
      .required(),
    whiteboard: yup.object().when(['type'], ([type], schema) => {
      return type === CalloutFramingType.Whiteboard ? schema.required() : schema;
    }),
    link: yup.object().when(['type'], ([type], schema) => {
      return type === CalloutFramingType.Link
        ? schema
            .shape({
              uri: urlValidator({ required: true }),
              profile: yup
                .object()
                .shape({
                  displayName: displayNameValidator({ required: true }),
                })
                .required(),
            })
            .required()
        : schema.nullable();
    }),
    poll: yup.object().when(['type'], ([type], schema) => {
      return type === CalloutFramingType.Poll
        ? schema
            .shape({
              title: displayNameValidator({ required: true }),
              options: yup
                .array()
                .of(yup.object().shape({ text: yup.string().required() }))
                .min(MIN_POLL_OPTIONS)
                .max(MAX_POLL_OPTIONS)
                .required(),
              settings: yup
                .object()
                .shape({
                  minResponses: yup.number().min(1).required(),
                  maxResponses: yup.number().min(0).required(),
                  resultsVisibility: yup
                    .mixed<PollResultsVisibility>()
                    .oneOf(Object.values(PollResultsVisibility).filter(value => typeof value === 'string'))
                    .required(),
                  resultsDetail: yup
                    .mixed<PollResultsDetail>()
                    .oneOf(Object.values(PollResultsDetail).filter(value => typeof value === 'string'))
                    .required(),
                })
                .required(),
            })
            .test('min-responses-within-options', 'forms.validations.pollMinResponsesWithinOptions', function (value) {
              const optionsCount = value?.options?.length ?? 0;
              const minResponses = value?.settings?.minResponses;

              if (typeof minResponses !== 'number') {
                return true;
              }

              if (minResponses <= optionsCount) {
                return true;
              }

              return this.createError({ path: `${this.path}.settings.minResponses` });
            })
            .test('max-responses-within-options', 'forms.validations.pollMaxResponsesWithinOptions', function (value) {
              const optionsCount = value?.options?.length ?? 0;
              const maxResponses = value?.settings?.maxResponses;

              if (typeof maxResponses !== 'number') {
                return true;
              }

              if (maxResponses <= optionsCount) {
                return true;
              }

              return this.createError({ path: `${this.path}.settings.maxResponses` });
            })
            .test(
              'min-responses-within-max-responses',
              'forms.validations.pollMinResponsesWithinMaxResponses',
              function (value) {
                const minResponses = value?.settings?.minResponses;
                const maxResponses = value?.settings?.maxResponses;

                if (typeof minResponses !== 'number' || typeof maxResponses !== 'number') {
                  return true;
                }

                if (maxResponses === 0 || minResponses <= maxResponses) {
                  return true;
                }

                return this.createError({ path: `${this.path}.settings.minResponses` });
              }
            )
            .required()
        : schema.nullable();
    }),
  }),
  contributionDefaults: yup.object().shape({
    defaultDisplayName: displayNameValidator().optional().nullable(),
    postDescription: MarkdownValidator(MARKDOWN_TEXT_LENGTH).nullable(),
    whiteboardContent: textLengthValidator().nullable(),
  }),
  contributions: yup.object().shape({
    links: referenceSegmentSchema.nullable(),
  }),
  settings: yup.object().shape({
    contribution: yup.object().shape({
      enabled: yup.boolean().required(),
      allowedTypes: yup
        .mixed<string>()
        .oneOf(['none', ...Object.values(CalloutContributionType)].filter(value => typeof value === 'string'))
        .required(),
      canAddContributions: yup
        .mixed<CalloutAllowedActors>()
        .oneOf(Object.values(CalloutAllowedActors).filter(value => typeof value === 'string'))
        .required(),
      commentsEnabled: yup.boolean().required(),
    }),
    framing: yup.object().shape({
      commentsEnabled: yup.boolean().required(),
    }),
    visibility: yup
      .mixed<CalloutVisibility>()
      .oneOf(Object.values(CalloutVisibility).filter(value => typeof value === 'string'))
      .required(),
  }),
});
