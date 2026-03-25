import { Alert, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import type { FormikSelectValue } from '@/core/ui/forms/FormikAutocomplete';
import { FormikAutocomplete } from '@/core/ui/forms/FormikAutocomplete';
import Gutters from '@/core/ui/grid/Gutters';
import { Caption } from '@/core/ui/typography';

const T_PREFIX = 'pages.admin.spaceConversion';

type SpaceConversionOperationsProps = {
  level: SpaceLevel | undefined;
  siblingSubspaces: FormikSelectValue[];
  siblingsLoading: boolean;
  mutationLoading: boolean;
  onPromoteL1ToL0: () => Promise<void>;
  onDemoteL1ToL2: (parentSpaceL1ID: string) => Promise<void>;
  onPromoteL2ToL1: () => Promise<void>;
};

const SpaceConversionOperations = ({
  level,
  siblingSubspaces,
  siblingsLoading,
  mutationLoading,
  onPromoteL1ToL0,
  onDemoteL1ToL2,
  onPromoteL2ToL1,
}: SpaceConversionOperationsProps) => {
  const { t } = useTranslation();
  const [confirmDialog, setConfirmDialog] = useState<'L1toL0' | 'L1toL2' | 'L2toL1' | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>();
  const [operation, setOperation] = useState<'promote' | 'demote'>('promote');

  const hasValidParentSelection = Boolean(selectedParentId && siblingSubspaces.some(s => s.id === selectedParentId));

  if (level === SpaceLevel.L0) {
    return <Alert severity="info">{t(`${T_PREFIX}.noConversions`)}</Alert>;
  }

  const handleConfirm = async () => {
    switch (confirmDialog) {
      case 'L1toL0':
        await onPromoteL1ToL0();
        break;
      case 'L1toL2':
        if (hasValidParentSelection && selectedParentId) {
          await onDemoteL1ToL2(selectedParentId);
        }
        break;
      case 'L2toL1':
        await onPromoteL2ToL1();
        break;
    }
    setConfirmDialog(null);
  };

  const confirmDialogContent = {
    L1toL0: {
      title: t(`${T_PREFIX}.promoteL1ToL0.confirmTitle`),
      content: t(`${T_PREFIX}.promoteL1ToL0.confirmWarning`),
    },
    L1toL2: {
      title: t(`${T_PREFIX}.demoteL1ToL2.confirmTitle`),
      content: t(`${T_PREFIX}.demoteL1ToL2.confirmWarning`),
    },
    L2toL1: {
      title: t(`${T_PREFIX}.promoteL2ToL1.confirmTitle`),
      content: t(`${T_PREFIX}.promoteL2ToL1.confirmWarning`),
    },
  };

  return (
    <>
      <Gutters disablePadding={true}>
        {level === SpaceLevel.L1 && (
          <>
            <ToggleButtonGroup
              value={operation}
              exclusive={true}
              onChange={(_event, value) => value && setOperation(value)}
              fullWidth={true}
            >
              <ToggleButton value="promote">{t(`${T_PREFIX}.promote`)}</ToggleButton>
              <ToggleButton value="demote">{t(`${T_PREFIX}.demote`)}</ToggleButton>
            </ToggleButtonGroup>
            {operation === 'promote' && (
              <>
                <Alert severity="info" variant="outlined">
                  {t(`${T_PREFIX}.promoteL1ToL0.hint`)}
                </Alert>
                <Button
                  variant="outlined"
                  onClick={() => setConfirmDialog('L1toL0')}
                  disabled={mutationLoading}
                  fullWidth={true}
                >
                  {t(`${T_PREFIX}.promoteL1ToL0.button`)}
                </Button>
              </>
            )}
            {operation === 'demote' && (
              <>
                <Alert severity="warning" variant="outlined">
                  {t(`${T_PREFIX}.demoteL1ToL2.hint`)}
                </Alert>
                {siblingSubspaces.length > 0 ? (
                  <Formik initialValues={{ parentSpaceId: '' }} onSubmit={() => Promise.resolve()}>
                    <Form>
                      <Gutters disablePadding={true}>
                        <FormikAutocomplete
                          name="parentSpaceId"
                          values={siblingSubspaces}
                          label={t(`${T_PREFIX}.demoteL1ToL2.targetLabel`)}
                          disabled={siblingsLoading || mutationLoading}
                          onChange={value => setSelectedParentId(value?.id)}
                        />
                        <Button
                          variant="outlined"
                          color="warning"
                          onClick={() => setConfirmDialog('L1toL2')}
                          disabled={!hasValidParentSelection || mutationLoading}
                          fullWidth={true}
                        >
                          {t(`${T_PREFIX}.demoteL1ToL2.button`)}
                        </Button>
                      </Gutters>
                    </Form>
                  </Formik>
                ) : (
                  !siblingsLoading && <Caption>{t(`${T_PREFIX}.demoteL1ToL2.noTargets`)}</Caption>
                )}
              </>
            )}
          </>
        )}
        {level === SpaceLevel.L2 && (
          <>
            <Alert severity="info" variant="outlined">
              {t(`${T_PREFIX}.promoteL2ToL1.hint`)}
            </Alert>
            <Button
              variant="outlined"
              onClick={() => setConfirmDialog('L2toL1')}
              disabled={mutationLoading}
              fullWidth={true}
            >
              {t(`${T_PREFIX}.promoteL2ToL1.button`)}
            </Button>
          </>
        )}
      </Gutters>
      {confirmDialog && (
        <ConfirmationDialog
          entities={{
            title: confirmDialogContent[confirmDialog].title,
            content: confirmDialogContent[confirmDialog].content,
          }}
          actions={{
            onConfirm: handleConfirm,
            onCancel: () => setConfirmDialog(null),
          }}
          options={{ show: true }}
          state={{ isLoading: mutationLoading }}
        />
      )}
    </>
  );
};

export default SpaceConversionOperations;
