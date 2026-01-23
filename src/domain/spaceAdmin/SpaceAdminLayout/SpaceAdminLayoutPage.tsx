import { useSpaceCollaborationIdQuery } from '@/core/apollo/generated/apollo-hooks';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import InnovationFlowCollaborationToolsBlock from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowCollaborationToolsBlock';
import useInnovationFlowSettings from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import type { SettingsPageProps } from '@/domain/platformAdmin/layout/EntitySettingsLayout/types';
import { Box } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpace } from '../../space/context/useSpace';
import LayoutSwitcher from '../layout/SpaceAdminLayoutSwitcher';

export interface SpaceAdminLayoutPageProps extends SettingsPageProps {
  useL0Layout: boolean;
}

const SpaceAdminLayoutPage: FC<SpaceAdminLayoutPageProps> = ({ useL0Layout, routePrefix = '../' }) => {
  const { t } = useTranslation();
  const { space, loading: spaceLoading } = useSpace();
  const { data: collaborationData, loading: collaborationLoading } = useSpaceCollaborationIdQuery({
    variables: {
      spaceId: space.id,
    },
    skip: !space.id,
  });
  const collaborationId = collaborationData?.lookup.space?.collaboration.id;

  const { data, actions, state } = useInnovationFlowSettings({
    collaborationId,
    skip: !collaborationId,
  });
  const { innovationFlow, callouts } = data;
  const loading = spaceLoading || collaborationLoading || state.loading;

  return (
    <LayoutSwitcher currentTab={SettingsSection.Layout} tabRoutePrefix={routePrefix} useL0Layout={useL0Layout}>
      <PageContentColumn columns={12}>
        <PageContentBlock>
          <PageContentBlockHeader title={t('pages.admin.generic.sections.layout.innovationFlowEditor')} />
          <Box overflow="auto">
            <InnovationFlowCollaborationToolsBlock
              callouts={callouts}
              loading={loading}
              innovationFlow={innovationFlow}
              onUpdateCurrentState={actions.updateInnovationFlowCurrentState}
              onUpdateFlowStateOrder={actions.updateInnovationFlowStateOrder}
              onUpdateCalloutFlowState={actions.updateCalloutFlowState}
              onCreateFlowState={(state, options) => actions.createState(state, options.after)}
              onEditFlowState={actions.editState}
              onDeleteFlowState={actions.deleteState}
              onSetDefaultTemplate={actions.setDefaultTemplate}
              disableStateNumberChange
            />
          </Box>
        </PageContentBlock>
      </PageContentColumn>
    </LayoutSwitcher>
  );
};

export default SpaceAdminLayoutPage;
