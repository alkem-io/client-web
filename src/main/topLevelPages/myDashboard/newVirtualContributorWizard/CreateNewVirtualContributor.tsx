import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import LibraryBooksOutlined from '@mui/icons-material/LibraryBooksOutlined';
import { Box, Button, type ButtonProps, DialogContent, Tooltip } from '@mui/material';
import { Form, Formik } from 'formik';
import { type MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  AiPersonaEngine,
  VirtualContributorBodyOfKnowledgeType,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { FormikInputField } from '@/core/ui/forms/FormikInputField/FormikInputField';
import { MARKDOWN_TEXT_LENGTH, MID_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownFieldLazy';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { useScreenSize } from '@/core/ui/grid/constants';
import GridContainer from '@/core/ui/grid/GridContainer';
import { useColumns } from '@/core/ui/grid/GridContext';
import GridItem from '@/core/ui/grid/GridItem';
import GridProvider from '@/core/ui/grid/GridProvider';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import Loading from '@/core/ui/loading/Loading';
import { theme } from '@/core/ui/themes/default/Theme';
import { Caption } from '@/core/ui/typography';
import FormikVisualUpload from '@/core/ui/upload/FormikVisualUpload/FormikVisualUpload';
import type { VisualUploadModel } from '@/core/ui/upload/VisualUpload/VisualUpload.model';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import LogoSmallImage from '@/main/ui/logo/logoSmall.svg?react';

type CreateNewVirtualContributorProps = {
  onClose: () => void;
  onChangeAvatar: (visual: VisualUploadModel) => void;
  onCreateKnowledge: (values: VirtualContributorFromProps) => void;
  onUseExistingKnowledge: (values: VirtualContributorFromProps) => void;
  onUseExternal: (values: VirtualContributorFromProps) => void;
  loading?: boolean;
  titleId?: string;
};

enum VCSourceOptions {
  WRITTEN_KNOWLEDGE = 'createSpace',
  EXISTING_SPACE = 'existingSpace',
  EXTERNAL = 'external',
}

export interface VirtualContributorFromProps {
  name: string;
  tagline: string;
  description: string;
  externalConfig?: {
    apiKey?: string;
    assistantId?: string;
  };
  engine: AiPersonaEngine;
  bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType;
}

const BigButton = ({
  tooltipDisabled,
  selected,
  startIcon,
  ...props
}: ButtonProps & { tooltipDisabled?: string; selected?: boolean }) => {
  const button = (
    <Box display="flex" flexBasis="50%">
      <Button
        variant="outlined"
        startIcon={startIcon}
        sx={{
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexGrow: 1,
          gap: gutters(0.5),
          textTransform: 'none',
          borderColor: selected ? 'primary.main' : 'divider',
          opacity: selected ? 1 : 0.9,
          paddingTop: gutters(0.5),
          '&:active': { border: `1px solid ${theme.palette.text.primary};` },
        }}
        {...props}
      />
    </Box>
  );

  return tooltipDisabled && props.disabled ? <Tooltip title={tooltipDisabled}>{button}</Tooltip> : button;
};

const CreateNewVirtualContributor = ({
  onClose,
  onCreateKnowledge,
  onUseExistingKnowledge,
  onUseExternal,
  loading,
  onChangeAvatar,
  titleId,
}: CreateNewVirtualContributorProps) => {
  const { t } = useTranslation();
  const { isSmallScreen } = useScreenSize();

  const cols = useColumns();
  const isMobile = cols < 5;

  const initialValues: VirtualContributorFromProps = {
    name: '',
    tagline: '',
    description: '',
    engine: AiPersonaEngine.Expert,
    bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.AlkemioKnowledgeBase,
  };

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .trim()
      .min(3, ({ min }) => TranslatedValidatedMessageWithPayload('forms.validations.minLength')({ min }))
      .required(),
    tagline: textLengthValidator({ maxLength: MID_TEXT_LENGTH }),
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  });

  const [source, setSource] = useState<VCSourceOptions>();
  const selectVCSource = (event: MouseEvent<HTMLButtonElement>) => {
    setSource(event.currentTarget.value as VCSourceOptions);
  };

  const handleSubmit = (values: VirtualContributorFromProps) => {
    const name = values.name.trim();
    const newValues = { ...values, name };

    switch (source) {
      case VCSourceOptions.WRITTEN_KNOWLEDGE:
        onCreateKnowledge(newValues);
        break;
      case VCSourceOptions.EXISTING_SPACE:
        onUseExistingKnowledge(newValues);
        break;
      case VCSourceOptions.EXTERNAL:
        onUseExternal(newValues);
        break;
    }
  };

  return (
    <>
      <DialogHeader id={titleId} onClose={onClose} title={t('createVirtualContributorWizard.initial.title')} />
      <DialogContent sx={{ paddingTop: 0 }}>
        {loading && <Loading />}

        {!loading && (
          <Gutters disablePadding={true}>
            <Caption>{t('createVirtualContributorWizard.initial.profileDescription')}</Caption>

            <GridContainer disablePadding={true} sx={{ display: 'contents' }}>
              <GridProvider columns={12}>
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  enableReinitialize={true}
                  onSubmit={handleSubmit}
                >
                  {({ isValid }) => {
                    return (
                      <Form noValidate={true}>
                        <GridItem columns={isMobile ? cols : 8}>
                          <Gutters disablePadding={true}>
                            <Gutters disablePadding={true} flexDirection="row">
                              <FormikVisualUpload
                                flex={1}
                                name="visuals.avatar"
                                visualType={VisualType.Avatar}
                                onChangeAvatar={onChangeAvatar}
                              />

                              <Gutters disablePadding={true} flex={2}>
                                <FormikInputField
                                  name="name"
                                  title={t('components.nameSegment.name')}
                                  placeholder={t('components.nameSegment.name')}
                                  required={true}
                                />

                                <FormikInputField
                                  name="tagline"
                                  title={t('components.profileSegment.tagline.name')}
                                  placeholder={t('components.profileSegment.tagline.placeholder')}
                                />
                              </Gutters>
                            </Gutters>

                            <FormikMarkdownField
                              name="description"
                              title={t('components.profileSegment.description.name')}
                              placeholder={t('components.profileSegment.description.placeholder')}
                              rows={10}
                              multiline={true}
                              hideImageOptions={true}
                            />
                          </Gutters>
                        </GridItem>
                        <GridItem columns={isMobile ? cols : 8}>
                          <Gutters disablePadding={true} paddingTop={gutters()}>
                            <Caption>{t('createVirtualContributorWizard.initial.description')}</Caption>
                            <Box
                              display="flex"
                              flexDirection={isSmallScreen ? 'column' : 'row'}
                              width="100%"
                              gap={gutters()}
                            >
                              <BigButton
                                onClick={selectVCSource}
                                value={VCSourceOptions.WRITTEN_KNOWLEDGE}
                                startIcon={<LibraryBooksOutlined />}
                                selected={source === VCSourceOptions.WRITTEN_KNOWLEDGE}
                              >
                                {t('createVirtualContributorWizard.initial.createSpace')}
                                <Caption fontSize={9}>{t('createVirtualContributorWizard.initial.ownAI')}</Caption>
                              </BigButton>
                              <BigButton
                                onClick={selectVCSource}
                                value={VCSourceOptions.EXISTING_SPACE}
                                startIcon={
                                  <Box sx={{ svg: { height: gutters(1.2) } }}>
                                    <LogoSmallImage />
                                  </Box>
                                }
                                selected={source === VCSourceOptions.EXISTING_SPACE}
                              >
                                {t('createVirtualContributorWizard.initial.useExistingSpace')}
                                <Caption fontSize={9}>{t('createVirtualContributorWizard.initial.ownAI')}</Caption>
                              </BigButton>
                              <BigButton
                                onClick={selectVCSource}
                                value={VCSourceOptions.EXTERNAL}
                                startIcon={<CloudDownloadOutlinedIcon />}
                                selected={source === VCSourceOptions.EXTERNAL}
                              >
                                {t('createVirtualContributorWizard.initial.useExternalAI')}
                                <Caption fontSize={9}>{t('createVirtualContributorWizard.initial.externalAI')}</Caption>
                              </BigButton>
                            </Box>
                          </Gutters>
                        </GridItem>
                        <Actions marginTop={theme.spacing(2)} sx={{ justifyContent: 'end', flexBasis: '100%' }}>
                          <Button type="submit" variant="contained" disabled={!isValid || !source}>
                            {t('buttons.create')}
                          </Button>
                        </Actions>
                      </Form>
                    );
                  }}
                </Formik>
              </GridProvider>
            </GridContainer>
          </Gutters>
        )}
      </DialogContent>
    </>
  );
};

export default CreateNewVirtualContributor;
