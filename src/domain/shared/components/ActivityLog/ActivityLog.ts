import { ActivityEventType } from '../../../../models/graphql-schema';
// todo maybe move it to another place
export interface ActivityLog {
  id: string;
  type: ActivityEventType;
  collaborationID: string;
  resourceID: string;
  triggeredBy: string;
  createdDate: Date;
  description: string;
}
