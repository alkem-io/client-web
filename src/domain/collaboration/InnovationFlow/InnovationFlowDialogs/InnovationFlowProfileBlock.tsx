import { AutoGraphOutlined, Close } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { Box, DialogActions, IconButton, Theme, useMediaQuery } from '@mui/material';
import { cloneElement, FC, ReactElement, useState } from 'react';
import { Reference, TagsetType, UpdateProfileInput, Visual } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockGrid from '../../../../core/ui/content/PageContentBlockGrid';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import Gutters from '../../../../core/ui/grid/Gutters';
import { BlockTitle } from '../../../../core/ui/typography';
import InnovationFlowProfileForm, { InnovationFlowProfileFormValues } from './InnovationFlowProfileForm';
import InnovationFlowProfileView from './InnovationFlowProfileView';
import { gutters } from '../../../../core/ui/grid/utils';
import Icon from '../../../../core/ui/icon/Icon';
import { useTranslation } from 'react-i18next';
import { DialogFooter } from '../../../../core/ui/dialog/DialogWithGrid';
import { useInView } from 'react-intersection-observer';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';

export interface InnovationFlowProfile {
  id: string;
  displayName: string;
  description?: string;
  bannerNarrow?: Visual;
  tags?: {
    tags: string[];
  };
  tagsets?: {
    id: string;
    name: string;
    tags: string[];
    allowedValues: string[];
    type: TagsetType;
  }[];
  references?: Reference[];
}

export interface InnovationFlowProfileBlockProps {
  innovationFlow?: {
    id: string;
    profile: InnovationFlowProfile;
    lifecycle?: {
      state?: string;
      stateIsFinal: boolean;
      nextEvents?: string[];
    };
  };
  editable?: boolean;
  onUpdate?: (innovationFlowID: string, profileData: UpdateProfileInput) => Promise<unknown> | void;
  loading?: boolean;
}

const FormActionsRenderer = ({ children }: { children: ReactElement }) => {
  const { ref, inView } = useInView();

  return (
    <>
      {cloneElement(children, { ref })}
      <DialogFooter>{!inView && <DialogActions>{children}</DialogActions>}</DialogFooter>
    </>
  );
};

const InnovationFlowProfileBlock: FC<InnovationFlowProfileBlockProps> = ({
  editable = false,
  onUpdate,
  innovationFlow,
  children,
}) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [editMode, setEditMode] = useState(false);

  const handleUpdateProfile = async (innovationFlowId: string, profileData: InnovationFlowProfileFormValues) => {
    await onUpdate?.(innovationFlowId, {
      displayName: profileData.displayName,
      description: profileData.description,
      // TODO: Pending Tags
      references: profileData.references.map(({ id, ...reference }) => ({
        ID: id,
        ...reference,
      })),
    });
    setEditMode(false);
  };

  return (
    <PageContentBlock disablePadding disableGap>
      <PageContentBlockGrid disablePadding>
        {editMode && innovationFlow && (
          <PageContentColumn columns={12}>
            <PageContentBlockSeamless>
              <InnovationFlowProfileForm
                profile={innovationFlow.profile}
                onSubmit={profileData => handleUpdateProfile(innovationFlow.id, profileData)}
                onCancel={() => setEditMode(false)}
                actionsRenderer={FormActionsRenderer}
              />
            </PageContentBlockSeamless>
          </PageContentColumn>
        )}
        {!editMode && (
          <>
            <PageContentColumn columns={8}>
              <Gutters width="100%">
                <Box display="flex" justifyContent="space-between">
                  <BlockTitle>{innovationFlow?.profile.displayName}</BlockTitle>
                  {editable && (
                    <IconButton
                      onClick={() => setEditMode(editMode => !editMode)}
                      aria-label={editMode ? t('buttons.cancel') : t('buttons.edit')}
                    >
                      {editMode ? <Close /> : <EditIcon />}
                    </IconButton>
                  )}
                </Box>
                <InnovationFlowProfileView innovationFlow={innovationFlow} />
              </Gutters>
            </PageContentColumn>
            <PageContentColumn columns={isMobile ? 8 : 4} flexDirection="column">
              {innovationFlow?.profile.bannerNarrow?.uri ? (
                <Box
                  component="img"
                  width="100%"
                  src={innovationFlow.profile.bannerNarrow.uri}
                  alt={innovationFlow.profile.bannerNarrow.alternativeText}
                />
              ) : (
                <Box width="100%" padding={gutters(2)} display="flex" justifyContent="center" alignItems="center">
                  <Icon iconComponent={AutoGraphOutlined} color="primary" size="xxl" />
                </Box>
              )}

              {children}
            </PageContentColumn>
            <DialogFooter />
          </>
        )}
      </PageContentBlockGrid>
    </PageContentBlock>
  );
};

export default InnovationFlowProfileBlock;
