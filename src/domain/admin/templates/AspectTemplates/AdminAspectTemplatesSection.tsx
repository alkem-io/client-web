import DashboardGenericSection from '../../../../components/composite/common/sections/DashboardGenericSection';
import { Button } from '@mui/material';
import TemplatesList from '../TemplatesList';
import AspectTemplateCard from './AspectTemplateCard';
import CreateAspectTemplateDialog from './CreateAspectTemplateDialog';
import EditAspectTemplateDialog from './EditAspectTemplateDialog';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateAspectTemplateMutation, useUpdateAspectTemplateMutation } from '../../../../hooks/generated/graphql';
import { AspectTemplateFormSubmittedValues } from './AspectTemplateForm';
import { AspectTemplate } from '../../../../models/graphql-schema';
import { TemplateCardProps } from '../TemplateCardProps';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';

interface AdminAspectTemplatesSectionProps {
  aspectTemplateId: string | undefined;
  templatesSetId: string | undefined;
  aspectTemplates: AspectTemplate[] | undefined;
  onCloseAspectTemplateUpdateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildAspectTemplateLink: (aspect: AspectTemplate) => { url: string; linkState: TemplateCardProps['linkState'] };
}

const AdminAspectTemplatesSection = ({
  aspectTemplates,
  aspectTemplateId,
  templatesSetId,
  buildAspectTemplateLink,
  onCloseAspectTemplateUpdateDialog,
  refetchQueries,
}: AdminAspectTemplatesSectionProps) => {
  const { t } = useTranslation();

  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);

  const openCreateTemplateDialog = useCallback(() => setIsCreateTemplateDialogOpen(true), []);
  const closeCreateAspectTemplateDialog = useCallback(() => setIsCreateTemplateDialogOpen(false), []);

  const [updateAspectTemplate] = useUpdateAspectTemplateMutation();
  const [createAspectTemplate] = useCreateAspectTemplateMutation();

  const handleAspectTemplateUpdate = async (values: AspectTemplateFormSubmittedValues) => {
    await updateAspectTemplate({
      variables: {
        aspectTemplateInput: {
          ID: aspectTemplateId!,
          ...values,
        },
      },
      refetchQueries,
    });
    onCloseAspectTemplateUpdateDialog();
  };

  const handleAspectTemplateCreation = async (values: AspectTemplateFormSubmittedValues) => {
    await createAspectTemplate({
      variables: {
        aspectTemplateInput: {
          templatesSetID: templatesSetId!,
          ...values,
        },
      },
      refetchQueries,
    });
    closeCreateAspectTemplateDialog();
  };

  const aspectTemplate = aspectTemplateId ? aspectTemplates?.find(({ id }) => id === aspectTemplateId) : undefined;

  return (
    <>
      <DashboardGenericSection
        headerText={t('pages.admin.generic.sections.templates.aspect-templates')}
        primaryAction={
          <Button variant="outlined" onClick={openCreateTemplateDialog}>
            {t('common.create-new')}
          </Button>
        }
      >
        <TemplatesList>
          {aspectTemplates?.map(aspectTemplate => (
            <AspectTemplateCard
              key={aspectTemplate.id}
              title={aspectTemplate.info.title}
              {...buildAspectTemplateLink(aspectTemplate)}
            />
          ))}
        </TemplatesList>
      </DashboardGenericSection>
      <CreateAspectTemplateDialog
        open={isCreateTemplateDialogOpen}
        onClose={closeCreateAspectTemplateDialog}
        onSubmit={handleAspectTemplateCreation}
      />
      <EditAspectTemplateDialog
        open={!!aspectTemplate}
        onClose={onCloseAspectTemplateUpdateDialog}
        aspectTemplate={aspectTemplate!}
        onSubmit={handleAspectTemplateUpdate}
      />
    </>
  );
};

export default AdminAspectTemplatesSection;
