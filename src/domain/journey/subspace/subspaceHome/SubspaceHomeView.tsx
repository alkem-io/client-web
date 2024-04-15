import { useTranslation } from 'react-i18next';
import PageContent from '../../../../core/ui/content/PageContent';
import useStateWithAsyncDefault from '../../../../core/utils/useStateWithAsyncDefault';
import { JourneyTypeName } from '../../JourneyTypeName';
import MembershipBackdrop from '../../../shared/components/Backdrops/MembershipBackdrop';
import { CalloutGroupName, CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';
import InnovationFlowStates from '../../../collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { OrderUpdate, TypedCallout } from '../../../collaboration/callout/useCallouts/useCallouts';
import { InnovationFlowState } from '../../../collaboration/InnovationFlow/InnovationFlow';
import InfoColumn from '../../../../core/ui/content/InfoColumn';
import ContentColumn from '../../../../core/ui/content/ContentColumn';
import JourneyDashboardWelcomeBlock from '../../common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
import React from 'react';
import { EntityDashboardLeads } from '../../../community/community/EntityDashboardContributorsSection/Types';
import { SendMessage } from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import DashboardNavigation from '../../dashboardNavigation/DashboardNavigation';
import { DashboardNavigationItem } from '../../space/spaceDashboardNavigation/useSpaceDashboardNavigation';

interface SubspaceHomeViewProps {
  journeyId: string | undefined;
  collaborationId: string | undefined;
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentInnovationFlowState: string | undefined;
  canEditInnovationFlow: boolean | undefined;
  callouts: TypedCallout[] | undefined;
  groupedCallouts: Record<CalloutGroupName, TypedCallout[] | undefined>;
  canCreateCallout: boolean;
  canCreateCalloutFromTemplate: boolean;
  calloutNames: string[];
  loading: boolean;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  journeyTypeName: JourneyTypeName;
  // profile: {
  //   displayName: string;
  // } | undefined;
  context:
    | {
        vision?: string;
      }
    | undefined;
  community:
    | (EntityDashboardLeads & {
        myMembershipStatus?: CommunityMembershipStatus;
      })
    | undefined;
  sendMessage: SendMessage;
  spaceUrl: string;
  spaceDisplayName: string;
  dashboardNavigation: DashboardNavigationItem[] | undefined;
}

const SubspaceHomeView = ({
  journeyId,
  collaborationId,
  innovationFlowStates,
  currentInnovationFlowState,
  canEditInnovationFlow = false,
  callouts: allCallouts,
  groupedCallouts,
  canCreateCallout,
  canCreateCalloutFromTemplate,
  calloutNames,
  loading,
  onCalloutsSortOrderUpdate,
  refetchCallout,
  journeyTypeName,
  context,
  community,
  sendMessage,
  spaceUrl,
  spaceDisplayName,
  dashboardNavigation,
}: SubspaceHomeViewProps) => {
  const [selectedInnovationFlowState, setSelectedInnovationFlowState] =
    useStateWithAsyncDefault(currentInnovationFlowState);

  const filterCallouts = (callouts: TypedCallout[] | undefined) => {
    return callouts?.filter(callout => {
      if (!selectedInnovationFlowState) {
        return true;
      }
      return callout.flowStates?.includes(selectedInnovationFlowState);
    });
  };

  const { t } = useTranslation();

  const handleSelectInnovationFlowState = (state: InnovationFlowState) =>
    setSelectedInnovationFlowState(state.displayName);

  return (
    <>
      <MembershipBackdrop show={!loading && !allCallouts} blockName={t(`common.${journeyTypeName}` as const)}>
        <PageContent>
          <InfoColumn>
            <JourneyDashboardWelcomeBlock
              vision={context?.vision ?? ''}
              leadUsers={community?.leadUsers}
              onContactLeadUser={receiver => sendMessage('user', receiver)}
              leadOrganizations={community?.leadOrganizations}
              onContactLeadOrganization={receiver => sendMessage('organization', receiver)}
              journeyTypeName="subspace"
              member={community?.myMembershipStatus === CommunityMembershipStatus.Member}
            />
            <DashboardNavigation
              currentItemId={journeyId}
              spaceUrl={spaceUrl}
              displayName={spaceDisplayName}
              dashboardNavigation={dashboardNavigation}
            />
          </InfoColumn>

          <ContentColumn>
            {innovationFlowStates &&
              currentInnovationFlowState &&
              selectedInnovationFlowState &&
              (canEditInnovationFlow ? (
                <InnovationFlowStates
                  collaborationId={collaborationId!}
                  states={innovationFlowStates}
                  currentState={currentInnovationFlowState}
                  selectedState={selectedInnovationFlowState}
                  showSettings
                  onSelectState={handleSelectInnovationFlowState}
                />
              ) : (
                <InnovationFlowStates
                  states={innovationFlowStates}
                  currentState={currentInnovationFlowState}
                  selectedState={selectedInnovationFlowState}
                  onSelectState={handleSelectInnovationFlowState}
                />
              ))}
            <CalloutsGroupView
              callouts={filterCallouts(groupedCallouts[CalloutGroupName.Contribute_2])}
              canCreateCallout={canCreateCallout}
              canCreateCalloutFromTemplate={canCreateCalloutFromTemplate}
              loading={loading}
              journeyTypeName={journeyTypeName}
              calloutNames={calloutNames}
              onSortOrderUpdate={onCalloutsSortOrderUpdate}
              onCalloutUpdate={refetchCallout}
              groupName={CalloutGroupName.Contribute_2}
              createButtonPlace="top"
              flowState={selectedInnovationFlowState}
            />
          </ContentColumn>
        </PageContent>
      </MembershipBackdrop>
    </>
  );
};

export default SubspaceHomeView;
