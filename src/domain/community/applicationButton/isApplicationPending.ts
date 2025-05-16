import { ApplicationState } from '../models/InvitationApplicationConstants';

const isApplicationPending = (applicationState?: string) =>
  applicationState === ApplicationState.NEW || applicationState === ApplicationState.REJECTED;
export default isApplicationPending;
