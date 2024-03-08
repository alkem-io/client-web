import React, { FC, useCallback, useState } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege } from '../../../../../core/apollo/generated/graphql-schema';
import SelectInnovationFlowDialog, {
  InnovationFlowTemplate,
  SelectInnovationFlowFormValuesType,
} from './SelectInnovationFlowDialog';
import InnovationFlowUpdateConfirmDialog from './InnovationFlowUpdateConfirmDialog';
import { useInnovationFlowAuthorizationQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { InnovationFlowState } from '../../../../collaboration/InnovationFlow/InnovationFlow';
import InnovationFlowVisualizer from './InnovationFlowVisualizer';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { BlockTitle } from '../../../../../core/ui/typography';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';

interface UpdateInnovationFlowProps {
  states: InnovationFlowState[] | undefined;
  currentState: string | undefined;
  onSetNewState: (selectedState: string) => Promise<unknown> | undefined;
  entityId: string;
  innovationFlowTemplates: InnovationFlowTemplate[] | undefined;
  onSubmit: (formData: SelectInnovationFlowFormValuesType) => void;
}

/**
 * @deprecated This file will be gone soon
 */
const UpdateInnovationFlow: FC<UpdateInnovationFlowProps> = ({
  states,
  currentState,
  entityId,
  innovationFlowTemplates,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [isSelectInnovationFlowDialogOpen, setSelectInnovationFlowDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  const openSelectInnovationFlowDialog = useCallback(() => setSelectInnovationFlowDialogOpen(true), []);
  const closeSelectInnovationFlowDialog = useCallback(() => setSelectInnovationFlowDialogOpen(false), []);
  const openConfirmationDialog = useCallback(() => setConfirmationDialogOpen(true), []);
  const closeConfirmationDialog = useCallback(() => setConfirmationDialogOpen(false), []);

  const innovationFlowTemplate = innovationFlowTemplates?.[0];

  const { data } = useInnovationFlowAuthorizationQuery({
    variables: { innovationFlowId: entityId! },
    skip: !entityId,
  });
  const myPrivileges = data?.lookup.innovationFlow?.authorization?.myPrivileges;

  const privileges = {
    canUpdate: (myPrivileges ?? []).includes(AuthorizationPrivilege.UpdateInnovationFlow),
  };

  let wiredSubmit;

  const handleConfirmDialogSubmit = () => {
    wiredSubmit?.();
    closeConfirmationDialog();
    closeSelectInnovationFlowDialog();
  };

  const handleSelectInnovationFlowFormSubmit = useCallback(
    (values: SelectInnovationFlowFormValuesType) => {
      onSubmit(values);
    },
    [onSubmit]
  );

  const handleSelectInnovationFlowDialogSubmit = useCallback(() => {
    openConfirmationDialog();
  }, [openConfirmationDialog]);

  return (
    <PageContentBlock>
      <Gutters>
        {innovationFlowTemplate?.profile.displayName && (
          <BlockTitle>
            {`${t('components.update-innovation-flow.template-label.title')}: ${innovationFlowTemplate?.profile.displayName
              }`}
          </BlockTitle>
        )}
        <InnovationFlowVisualizer states={states} currentState={currentState} />

        {privileges.canUpdate && (
          <Button
            variant="outlined"
            onClick={openSelectInnovationFlowDialog}
            sx={{ alignSelf: 'start', marginX: 1 }}
          >
            {t('buttons.change-template')}
          </Button>
        )}
        <SelectInnovationFlowDialog
          isOpen={isSelectInnovationFlowDialogOpen}
          onClose={closeSelectInnovationFlowDialog}
          onSubmitForm={handleSelectInnovationFlowFormSubmit}
          wireSubmit={submit => (wiredSubmit = submit)}
          onSubmitDialog={handleSelectInnovationFlowDialogSubmit}
          innovationFlowTemplateID={innovationFlowTemplate?.id}
          innovationFlowTemplates={innovationFlowTemplates}
        />
        <InnovationFlowUpdateConfirmDialog
          isOpen={isConfirmationDialogOpen}
          onClose={closeConfirmationDialog}
          onSubmit={handleConfirmDialogSubmit}
        />
      </Gutters>
    </PageContentBlock>
  );
};

export default UpdateInnovationFlow;
