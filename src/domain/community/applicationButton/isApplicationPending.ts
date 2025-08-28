import { ApplicationState } from '../invitations/InvitationApplicationConstants';

const isApplicationPending = (applicationState?: string) =>
  applicationState === ApplicationState.NEW || applicationState === ApplicationState.REJECTED;
export default isApplicationPending;
