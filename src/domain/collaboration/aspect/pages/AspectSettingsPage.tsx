import React, { FC, useEffect, useState } from 'react';
import { useNavigate, useResolvedPath } from 'react-router-dom';
import { Autocomplete, Button, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AspectForm, { AspectFormInput, AspectFormOutput } from '../AspectForm/AspectForm';
import useAspectSettings from '../../../../containers/aspect/AspectSettings/useAspectSettings';
import { useApolloErrorHandler, useNotification, useUrlParams } from '../../../../hooks';
import {
  AspectSettingsFragment,
  AuthorizationPrivilege,
  CalloutType,
  Visual,
} from '../../../../core/apollo/generated/graphql-schema';
import EditVisualsView from '../../../common/visual/views/EditVisualsView';
import SectionSpacer from '../../../shared/components/Section/SectionSpacer';
import { AspectDialogSection } from '../views/AspectDialogSection';
import { AspectLayout } from '../views/AspectLayoutWithOutlet';
import useCallouts from '../../callout/useCallouts';
import { useMoveAspectToCalloutMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { buildAspectUrl } from '../../../../common/utils/urlBuilders';

export interface AspectSettingsPageProps {
  onClose: () => void;
}

const AspectSettingsPage: FC<AspectSettingsPageProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { hubNameId = '', challengeNameId, opportunityNameId, aspectNameId = '', calloutNameId = '' } = useUrlParams();
  const resolved = useResolvedPath('.');
  const navigate = useNavigate();

  const [aspect, setAspect] = useState<AspectFormOutput>();

  const toAspectFormInput = (aspect?: AspectSettingsFragment): AspectFormInput | undefined =>
    aspect && {
      id: aspect.id,
      nameID: aspect.nameID,
      type: aspect.type,
      profileData: {
        description: aspect.profile?.description!,
        tags: aspect?.profile?.tagset?.tags,
      },
      displayName: aspect.displayName,
      references: aspect?.profile?.references,
    };

  const aspectIndex = resolved.pathname.indexOf('/aspects');
  const contributeUrl = resolved.pathname.substring(0, aspectIndex);

  const { entities, state, actions } = useAspectSettings({
    aspectNameId,
    hubNameId,
    challengeNameId,
    opportunityNameId,
    calloutNameId,
  });

  const handleError = useApolloErrorHandler();
  const notify = useNotification();

  const canMoveCard = entities.aspect?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.MoveCard);

  const [moveAspectToCallout, { loading: isMovingAspect }] = useMoveAspectToCalloutMutation({
    onError: handleError,
  });

  const [targetCalloutId, setTargetCalloutId] = useState(entities.parentCallout?.id);

  useEffect(() => {
    setTargetCalloutId(entities.parentCallout?.id);
  }, [entities.parentCallout]);

  const isMoveEnabled = Boolean(targetCalloutId) && targetCalloutId !== entities.parentCallout?.id;

  const { callouts, reloadCallouts } = useCallouts({
    hubNameId,
    challengeNameId,
    opportunityNameId,
  });

  const calloutsOfTypeCard = callouts?.filter(({ type }) => type === CalloutType.Card);

  // TODO This page component exposes too much of inner logic that should be encapsulated
  // either in a container/hook or a rendered view
  const visuals = (entities.aspect ? [entities.aspect.banner, entities.aspect.bannerNarrow] : []) as Visual[];
  const isAspectLoaded = Boolean(aspect && entities.aspect && !state.updating && !state.deleting && !isMovingAspect);

  const handleDelete = async () => {
    if (!entities.aspect || !aspect) {
      return;
    }

    await actions.handleDelete(entities.aspect.id);
    navigate(contributeUrl);
  };

  const handleUpdate = async (shouldUpdate: boolean) => {
    if (!entities.aspect || !aspect) {
      return;
    }

    if (shouldUpdate) {
      await actions.handleUpdate({
        id: entities.aspect.id,
        displayName: aspect.displayName,
        type: aspect.type,
        description: aspect.description,
        tags: aspect.tags,
        references: aspect.references,
      });
    }

    if (isMoveEnabled) {
      const { data, errors } = await moveAspectToCallout({
        variables: {
          aspectId: entities.aspect.id,
          calloutId: targetCalloutId!, // ensured by isMoveEnabled
        },
      });
      if (errors) {
        notify(t('aspect-edit.cardLocation.error'), 'error');
      } else if (!shouldUpdate) {
        notify(t('aspect-edit.cardLocation.success'), 'success');
      }
      const targetCalloutNameId = data!.moveAspectToCallout.callout!.nameID;
      const aspectNameId = data!.moveAspectToCallout.nameID;
      const aspectURL = buildAspectUrl(targetCalloutNameId, aspectNameId, {
        hubNameId,
        challengeNameId,
        opportunityNameId,
      });
      await reloadCallouts();
      navigate(`${aspectURL}/settings`, { replace: true });
    }
  };

  return (
    <AspectLayout currentSection={AspectDialogSection.Settings} onClose={onClose}>
      <AspectForm
        edit
        loading={state.loading || state.updating || isMovingAspect}
        aspect={toAspectFormInput(entities.aspect)}
        aspectNames={entities.aspectsNames}
        onChange={setAspect}
        onAddReference={actions.handleAddReference}
        onRemoveReference={actions.handleRemoveReference}
        tags={entities.aspect?.profile?.tagset?.tags}
      >
        {({ isValid, dirty }) => {
          const canSave = isAspectLoaded && dirty && isValid;

          return (
            <>
              <SectionSpacer double />
              <Box>
                <Typography variant={'h4'}>{t('common.visuals')}</Typography>
                <SectionSpacer />
                <EditVisualsView visuals={visuals} />
              </Box>
              <SectionSpacer double />
              {canMoveCard && (
                <Box>
                  <Typography variant={'h4'}>{t('aspect-edit.cardLocation.title')}</Typography>
                  <SectionSpacer />
                  <Autocomplete
                    disablePortal
                    options={calloutsOfTypeCard ?? []}
                    value={callouts?.find(({ id }) => id === targetCalloutId) ?? null!}
                    getOptionLabel={callout => callout.displayName}
                    onChange={(event, callout) => {
                      setTargetCalloutId(callout?.id);
                    }}
                    disableClearable
                    renderInput={params => (
                      <TextField
                        {...params}
                        label={t('aspect-edit.cardLocation.label')}
                        helperText={t('aspect-edit.cardLocation.reminder')}
                      />
                    )}
                  />
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'end', marginTop: 2, gap: theme => theme.spacing(1) }}>
                <Button
                  aria-label="delete-aspect"
                  variant="outlined"
                  color="error"
                  disabled={!isAspectLoaded}
                  onClick={handleDelete}
                >
                  {t('buttons.delete')}
                </Button>
                <Button
                  aria-label="save-aspect"
                  variant="contained"
                  disabled={!canSave && !isMoveEnabled}
                  onClick={() => handleUpdate(canSave)}
                >
                  {t('buttons.save')}
                </Button>
              </Box>
            </>
          );
        }}
      </AspectForm>
    </AspectLayout>
  );
};

export default AspectSettingsPage;
