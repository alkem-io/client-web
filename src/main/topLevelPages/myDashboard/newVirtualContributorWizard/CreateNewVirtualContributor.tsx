import React, { MouseEvent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { Box, Button, ButtonProps, DialogContent, Theme, Tooltip, useMediaQuery } from '@mui/material';
import LibraryBooksOutlined from '@mui/icons-material/LibraryBooksOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import { FormikInputField } from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Caption } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import Gutters from '../../../../core/ui/grid/Gutters';
import Loading from '../../../../core/ui/loading/Loading';
import LogoSmallImage from '../../../../main/ui/logo/logoSmall.svg?react';
import GridContainer from '../../../../core/ui/grid/GridContainer';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import GridItem from '../../../../core/ui/grid/GridItem';
import { Actions } from '../../../../core/ui/actions/Actions';
import { theme } from '../../../../core/ui/themes/default/Theme';
import { useColumns } from '../../../../core/ui/grid/GridContext';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import ExternalAIComingSoonDialog from './ExternalAICominSoonDialog';

type CreateNewVirtualContributorProps = {
  canCreateSubspace?: boolean;
  canUseExisting?: boolean;
  onClose: () => void;
  onCreateSpace: (values: VirtualContributorFromProps) => void;
  onUseExistingKnowledge: (values: VirtualContributorFromProps) => void;
  loading?: boolean;
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
  onCreateSpace,
  onUseExistingKnowledge,
  loading,
}: CreateNewVirtualContributorProps) => {
  const { t } = useTranslation();
  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const [exernalOpen, setExernalOpen] = useState(false);
  const closeExternalAI = useCallback(() => setExernalOpen(false), [setExernalOpen]);

  const cols = useColumns();
  const isMobile = cols < 5;

  const initialValues: VirtualContributorFromProps = {
    name: '',
    tagline: '',
    description: '',
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(),
    tagline: yup.string(),
    description: yup.string(),
  });

  const [source, setSource] = useState<VCSourceOptions>();
  const selectVCSource = (event: MouseEvent<HTMLButtonElement>) => {
    setSource(event.currentTarget.value as VCSourceOptions);
  };

  const handleSubmit = (values: VirtualContributorFromProps) => {
    switch (source) {
      case VCSourceOptions.WRITTEN_KNOWLEDGE:
        onCreateSpace(values);
        break;
      case VCSourceOptions.EXISTING_SPACE:
        onUseExistingKnowledge(values);
        break;
      case VCSourceOptions.EXTERNAL:
        setExernalOpen(true);
        break;
    }
  };

  return (
    <>
      <DialogHeader onClose={onClose}>{t('createVirtualContributorWizard.initial.title')}</DialogHeader>
      {loading && <Loading />}
      {!loading && (
        <DialogContent sx={{ paddingTop: 0 }}>
          <Gutters disablePadding>
            <Caption>{t('createVirtualContributorWizard.initial.profileDescription')}</Caption>
            <GridContainer disablePadding>
              <GridProvider columns={12}>
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  enableReinitialize
                  onSubmit={handleSubmit}
                >
                  {({ values }) => {
                    return (
                      <Form noValidate>
                        <GridItem columns={isMobile ? cols : 8}>
                          <Gutters disablePadding>
                            <FormikInputField
                              name="name"
                              title={t('components.nameSegment.name')}
                              placeholder={t('components.nameSegment.name')}
                              required
                            />
                            <FormikInputField
                              name="tagline"
                              title={t('components.profileSegment.tagline.name')}
                              placeholder={t('components.profileSegment.tagline.placeholder')}
                            />
                            <FormikMarkdownField
                              name="description"
                              title={t('components.profileSegment.description.name')}
                              placeholder={t('components.profileSegment.description.placeholder')}
                              rows={10}
                              multiline
                              hideImageOptions
                            />
                          </Gutters>
                        </GridItem>
                        <GridItem columns={isMobile ? cols : 8}>
                          <Gutters disablePadding paddingTop={gutters()}>
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
                                tooltipDisabled={t('createVirtualContributorWizard.initial.cannotCreateSubspace')}
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
                                tooltipDisabled={t('createVirtualContributorWizard.initial.cannotCreateSubspace')}
                                selected={source === VCSourceOptions.EXISTING_SPACE}
                              >
                                {t('createVirtualContributorWizard.initial.useExistingSpace')}
                                <Caption fontSize={9}>{t('createVirtualContributorWizard.initial.ownAI')}</Caption>
                              </BigButton>
                              <BigButton
                                onClick={selectVCSource}
                                value={VCSourceOptions.EXTERNAL}
                                startIcon={<CloudDownloadOutlinedIcon />}
                                tooltipDisabled={t('createVirtualContributorWizard.initial.cannotUseExisting')}
                                selected={source === VCSourceOptions.EXTERNAL}
                              >
                                {t('createVirtualContributorWizard.initial.useExternalAI')}
                                <Caption fontSize={9}>{t('createVirtualContributorWizard.initial.externalAI')}</Caption>
                              </BigButton>
                            </Box>
                          </Gutters>
                        </GridItem>
                        <Actions marginTop={theme.spacing(2)} sx={{ justifyContent: 'end', flexBasis: '100%' }}>
                          <Button type="submit" variant="contained" disabled={!values.name || !source}>
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
          <ExternalAIComingSoonDialog open={exernalOpen} onClose={closeExternalAI} />
        </DialogContent>
      )}
    </>
  );
};

export default CreateNewVirtualContributor;
