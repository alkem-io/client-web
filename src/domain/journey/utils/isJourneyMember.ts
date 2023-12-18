import { CommunityMembershipStatus } from '../../../core/apollo/generated/graphql-schema';

const isJourneyMember = (journey: { community?: { myMembershipStatus?: CommunityMembershipStatus } }) => {
  return journey.community?.myMembershipStatus === CommunityMembershipStatus.Member;
};

export default isJourneyMember;
