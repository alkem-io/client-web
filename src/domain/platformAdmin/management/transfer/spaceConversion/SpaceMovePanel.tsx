import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useConvertSpaceL1ToSpaceL0Mutation,
  useConvertSpaceL1ToSpaceL2Mutation,
  useSpaceMoveSourceSubspacesQuery,
  useSpaceMoveTargetL0SpacesQuery,
  useSpaceMoveTargetL1SubspacesQuery,
} from '@/core/apollo/generated/apollo-hooks';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { FormikAutocomplete } from '@/core/ui/forms/FormikAutocomplete';
import Gutters from '@/core/ui/grid/Gutters';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { Caption } from '@/core/ui/typography';

const T_PREFIX = 'pages.admin.spaceConversion';

type SpaceMovePanelProps = {
  resolvedSpaceId: string;
  levelZeroSpaceId: string;
  spaceName: string;
};

const SpaceMovePanel = ({ resolvedSpaceId, levelZeroSpaceId, spaceName }: SpaceMovePanelProps) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const [moveType, setMoveType] = useState<'toL0' | 'toL2'>('toL0');
  const [targetL0Id, setTargetL0Id] = useState<string | undefined>();
  const [targetL1Id, setTargetL1Id] = useState<string | undefined>();
  const [autoInvite, setAutoInvite] = useState(false);
  const [invitationMessage, setInvitationMessage] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);

  const { data: l0Data, loading: l0Loading } = useSpaceMoveTargetL0SpacesQuery({
    variables: { first: 100 },
  });

  const { data: l1Data, loading: l1Loading } = useSpaceMoveTargetL1SubspacesQuery({
    variables: { targetL0SpaceId: targetL0Id! },
    skip: moveType !== 'toL2' || !targetL0Id,
  });

  const { data: sourceData } = useSpaceMoveSourceSubspacesQuery({
    variables: { spaceId: resolvedSpaceId },
  });

  const hasChildren = (sourceData?.lookup.space?.subspaces?.length ?? 0) > 0;

  const [moveL1ToL0, { loading: moveL0Loading }] = useConvertSpaceL1ToSpaceL0Mutation();
  const [moveL1ToL2, { loading: moveL2Loading }] = useConvertSpaceL1ToSpaceL2Mutation();
  const mutationLoading = moveL0Loading || moveL2Loading;

  const targetL0Spaces = (l0Data?.spacesPaginated?.spaces ?? [])
    .filter(s => s.id !== levelZeroSpaceId)
    .map(s => ({ id: s.id, name: s.about.profile.displayName }));

  const targetL1Subspaces = (l1Data?.lookup.space?.subspaces ?? []).map(s => ({
    id: s.id,
    name: s.about.profile.displayName,
  }));

  const canExecuteL0 = Boolean(targetL0Id);
  const canExecuteL2 = Boolean(targetL0Id && targetL1Id && !hasChildren);

  const handleConfirm = async () => {
    let didExecute = false;
    try {
      if (moveType === 'toL0' && targetL0Id) {
        await moveL1ToL0({
          variables: {
            spaceL1ID: resolvedSpaceId,
          },
        });
        didExecute = true;
      } else if (moveType === 'toL2' && targetL1Id) {
        await moveL1ToL2({
          variables: {
            spaceL1ID: resolvedSpaceId,
            parentSpaceL1ID: targetL1Id,
          },
        });
        didExecute = true;
      }
      if (didExecute) {
        notify(t(`${T_PREFIX}.moveSuccess`), 'success');
      } else {
        notify(t(`${T_PREFIX}.moveError`), 'error');
      }
    } catch {
      notify(t(`${T_PREFIX}.moveError`), 'error');
    }
    setConfirmDialog(false);
  };

  const handleMoveTypeChange = (_event: React.MouseEvent, value: 'toL0' | 'toL2' | null) => {
    if (value) {
      setMoveType(value);
      setTargetL0Id(undefined);
      setTargetL1Id(undefined);
    }
  };

  const confirmContent =
    moveType === 'toL0'
      ? { title: t(`${T_PREFIX}.moveL1ToL0.confirmTitle`), content: t(`${T_PREFIX}.moveL1ToL0.confirmWarning`) }
      : { title: t(`${T_PREFIX}.moveL1ToL2.confirmTitle`), content: t(`${T_PREFIX}.moveL1ToL2.confirmWarning`) };

  return (
    <>
      <Gutters disablePadding={true}>
        <ToggleButtonGroup value={moveType} exclusive={true} onChange={handleMoveTypeChange} fullWidth={true}>
          <ToggleButton value="toL0">{t(`${T_PREFIX}.moveType.toL0`)}</ToggleButton>
          <ToggleButton value="toL2">{t(`${T_PREFIX}.moveType.toL2`)}</ToggleButton>
        </ToggleButtonGroup>

        {moveType === 'toL0' && (
          <>
            <Alert severity="info" variant="outlined">
              {t(`${T_PREFIX}.moveL1ToL0.hint`)}
            </Alert>
            {targetL0Spaces.length > 0 ? (
              <Formik initialValues={{ targetL0: '' }} onSubmit={() => Promise.resolve()}>
                <Form>
                  <FormikAutocomplete
                    name="targetL0"
                    values={targetL0Spaces}
                    label={t(`${T_PREFIX}.moveL1ToL0.targetLabel`)}
                    disabled={l0Loading || mutationLoading}
                    onChange={value => setTargetL0Id(value?.id)}
                  />
                </Form>
              </Formik>
            ) : (
              !l0Loading && <Caption>{t(`${T_PREFIX}.moveL1ToL2.noL0Targets`)}</Caption>
            )}
          </>
        )}

        {moveType === 'toL2' && (
          <>
            <Alert severity="warning" variant="outlined">
              {t(`${T_PREFIX}.moveL1ToL2.hint`)}
            </Alert>
            {hasChildren ? (
              <Alert severity="error" variant="outlined">
                {t(`${T_PREFIX}.moveL1ToL2.disabledHasChildren`)}
              </Alert>
            ) : targetL0Spaces.length > 0 ? (
              <Formik initialValues={{ targetL0: '', targetL1: '' }} onSubmit={() => Promise.resolve()}>
                <Form>
                  <Gutters disablePadding={true}>
                    <FormikAutocomplete
                      name="targetL0"
                      values={targetL0Spaces}
                      label={t(`${T_PREFIX}.moveL1ToL2.targetL0Label`)}
                      disabled={l0Loading || mutationLoading}
                      onChange={value => {
                        setTargetL0Id(value?.id);
                        setTargetL1Id(undefined);
                      }}
                    />
                    {targetL0Id &&
                      (targetL1Subspaces.length > 0 ? (
                        <FormikAutocomplete
                          name="targetL1"
                          values={targetL1Subspaces}
                          label={t(`${T_PREFIX}.moveL1ToL2.targetL1Label`)}
                          disabled={l1Loading || mutationLoading}
                          onChange={value => setTargetL1Id(value?.id)}
                        />
                      ) : (
                        !l1Loading && <Caption>{t(`${T_PREFIX}.moveL1ToL2.noL1Targets`)}</Caption>
                      ))}
                  </Gutters>
                </Form>
              </Formik>
            ) : (
              !l0Loading && <Caption>{t(`${T_PREFIX}.moveL1ToL2.noL0Targets`)}</Caption>
            )}
          </>
        )}

        <Tooltip title={t(`${T_PREFIX}.autoInvite.tooltip`)} placement="top-start">
          <FormControlLabel
            control={
              <Checkbox
                checked={autoInvite}
                onChange={e => {
                  setAutoInvite(e.target.checked);
                  if (e.target.checked) {
                    setInvitationMessage(t(`${T_PREFIX}.autoInvite.messagePlaceholder`));
                  } else {
                    setInvitationMessage('');
                  }
                }}
                disabled={mutationLoading}
              />
            }
            label={t(`${T_PREFIX}.autoInvite.label`)}
          />
        </Tooltip>
        {autoInvite && (
          <TextField
            label={t(`${T_PREFIX}.autoInvite.messagePlaceholder`)}
            value={invitationMessage}
            onChange={e => setInvitationMessage(e.target.value)}
            multiline={true}
            rows={2}
            fullWidth={true}
            disabled={mutationLoading}
          />
        )}

        <Button
          variant="outlined"
          color="warning"
          onClick={() => setConfirmDialog(true)}
          disabled={mutationLoading || (moveType === 'toL0' ? !canExecuteL0 : !canExecuteL2)}
          fullWidth={true}
        >
          {moveType === 'toL0' ? t(`${T_PREFIX}.moveL1ToL0.button`) : t(`${T_PREFIX}.moveL1ToL2.button`)}
        </Button>
      </Gutters>

      {confirmDialog && (
        <ConfirmationDialog
          entities={{
            title: confirmContent.title,
            content: confirmContent.content,
          }}
          actions={{
            onConfirm: handleConfirm,
            onCancel: () => setConfirmDialog(false),
          }}
          options={{ show: true }}
          state={{ isLoading: mutationLoading }}
        />
      )}
    </>
  );
};

export default SpaceMovePanel;
