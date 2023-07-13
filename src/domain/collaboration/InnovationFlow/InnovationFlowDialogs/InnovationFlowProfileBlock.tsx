import { AutoGraphOutlined, Close } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { Box, IconButton, Theme, useMediaQuery } from '@mui/material';
import { FC, useState } from 'react';
import { Lifecycle, Profile, Reference, Tagset, Visual } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockGrid from '../../../../core/ui/content/PageContentBlockGrid';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import Gutters from '../../../../core/ui/grid/Gutters';
import { BlockTitle } from '../../../../core/ui/typography';
import InnovationFlowProfileForm from './InnovationFlowProfileForm';
import InnovationFlowProfileView from './InnovationFlowProfileView';
import { gutters } from '../../../../core/ui/grid/utils';
import Icon from '../../../../core/ui/icon/Icon';

export type InnovationFlowProfile = Pick<Profile, 'id' | 'displayName' | 'description'> & {
  bannerNarrow?: Visual;
  tagsets?: Tagset[];
  references?: Reference[];
};

export interface InnovationFlowProfileBlockProps {
  innovationFlow:
    | {
        profile: InnovationFlowProfile;
        lifecycle?: Pick<Lifecycle, 'state' | 'stateIsFinal' | 'nextEvents'>;
      }
    | undefined;
  editable?: boolean;
  loading?: boolean;
}

const InnovationFlowProfileBlock: FC<InnovationFlowProfileBlockProps> = ({
  editable = false,
  innovationFlow,
  children,
}) => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [editMode, setEditMode] = useState(false);

  return (
    <PageContentBlock disablePadding disableGap>
      <PageContentBlockGrid disablePadding>
        {editMode && innovationFlow && (
          <InnovationFlowProfileForm
            profile={innovationFlow?.profile}
            onSubmit={() => {}}
            onCancel={() => setEditMode(false)}
          />
        )}
        {!editMode && (
          <>
            <PageContentColumn columns={isMobile ? 8 : 6}>
              <Gutters maxWidth="100%">
                <Box display="flex" justifyContent="space-between">
                  <BlockTitle>{innovationFlow?.profile.displayName}</BlockTitle>
                  {editable && (
                    <IconButton onClick={() => setEditMode(editMode => !editMode)}>
                      {editMode ? <Close /> : <EditIcon />}
                    </IconButton>
                  )}
                </Box>
                <InnovationFlowProfileView innovationFlow={innovationFlow} />
              </Gutters>
            </PageContentColumn>
            <PageContentColumn columns={isMobile ? 8 : 6} flexDirection="column">
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
          </>
        )}
      </PageContentBlockGrid>
    </PageContentBlock>
  );
};

export default InnovationFlowProfileBlock;
