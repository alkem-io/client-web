import React, { FC, useMemo, useState } from 'react';
import { useNavigate, useResolvedPath } from 'react-router-dom';
import { useUpdateNavigation, useUrlParams } from '../../hooks';
import { PageProps } from '../common';
import AspectSettingsContainer from '../../containers/aspect/AspectSettingsContainer/AspectSettingsContainer';
import AspectForm, { AspectFormInput, AspectFormOutput } from '../../components/composite/aspect/AspectForm/AspectForm';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import { AspectSettingsFragment, Visual } from '../../models/graphql-schema';
import EditVisualsView from '../../views/Visuals/EditVisualsView';
import { SectionSpacer } from '../../components/core/Section/Section';
import Typography from '@mui/material/Typography';

export interface AspectSettingsPageProps extends PageProps {}

const AspectSettingsPage: FC<AspectSettingsPageProps> = ({ paths: _paths }) => {
  const { t } = useTranslation();
  const { hubNameId = '', challengeNameId, opportunityNameId, aspectNameId = '' } = useUrlParams();
  const resolved = useResolvedPath('.');
  const navigate = useNavigate();
  const currentPaths = useMemo(() => [..._paths, { value: '', name: 'Settings', real: false }], [_paths, resolved]);
  useUpdateNavigation({ currentPaths });

  const [aspect, setAspect] = useState<AspectFormOutput>();

  const toAspectFormInput = (aspect?: AspectSettingsFragment): AspectFormInput | undefined =>
    aspect && {
      nameID: aspect.nameID,
      type: aspect.type,
      description: aspect.description,
      displayName: aspect.displayName,
      tags: aspect?.tagset?.tags,
      references: aspect?.references,
    };

  const aspectIndex = resolved.pathname.indexOf('/aspects');
  const contributeUrl = resolved.pathname.substring(0, aspectIndex);

  return (
    <AspectSettingsContainer
      hubNameId={hubNameId}
      aspectNameId={aspectNameId}
      challengeNameId={challengeNameId}
      opportunityNameId={opportunityNameId}
    >
      {(entities, state, actions) => {
        const visuals = (entities.aspect ? [entities.aspect.banner, entities.aspect.bannerNarrow] : []) as Visual[];
        const btnDisabled = !aspect || !entities.aspect || state.updating || state.deleting;

        const handleDelete = async () => {
          if (!entities.aspect || !aspect) {
            return;
          }

          actions.handleDelete(entities.aspect.id);
          navigate(contributeUrl);
        };

        const handleUpdate = () => {
          if (!entities.aspect || !aspect) {
            return;
          }

          actions.handleUpdate({
            id: entities.aspect.id,
            displayName: aspect.displayName,
            type: aspect.type,
            description: aspect.description,
            tags: aspect.tags,
            references: aspect.references,
          });
        };
        return (
          <>
            <AspectForm
              edit
              loading={state.loading || state.updating}
              aspect={toAspectFormInput(entities.aspect)}
              aspectNames={entities.aspects?.map(x => x.displayName)}
              onChange={setAspect}
              onAddReference={actions.handleAddReference}
              onRemoveReference={actions.handleRemoveReference}
            />
            <SectionSpacer double />
            <Box>
              <Typography variant={'h4'}>{t('common.visuals')}</Typography>
              <SectionSpacer />
              <EditVisualsView visuals={visuals} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'end', marginTop: 2, gap: theme => theme.spacing(1) }}>
              <Button
                aria-label="delete-aspect"
                variant="outlined"
                color="error"
                disabled={btnDisabled}
                onClick={handleDelete}
              >
                {t('buttons.delete')}
              </Button>
              <Button aria-label="save-aspect" variant="contained" disabled={btnDisabled} onClick={handleUpdate}>
                {t('buttons.save')}
              </Button>
            </Box>
          </>
        );
      }}
    </AspectSettingsContainer>
  );
};
export default AspectSettingsPage;
