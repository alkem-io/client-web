export const TOKEN_KEY = 'accessToken';

export const LOGO_REFERENCE_NAME = 'logo';

export const LOCAL_STORAGE_RETURN_URL_KEY = 'returnUrl';

export enum CommunityType {
  HUB = 'hub',
  CHALLENGE = 'challenge',
  OPPORTUNITY = 'opportunity',
}

export enum ActivityType {
  Opportunity = 'opportunities',
  Project = 'projects',
  Member = 'members',
  User = 'users',
  Organization = 'organizations',
  Hub = 'hubs',
  Challenge = 'challenges',
  Relation = 'relations',
  Aspect = 'aspects',
}

export enum RoleType {
  Lead = 'lead',
  Member = 'member',
  Host = 'host',
}

export const APPLICATION_STATE_NEW = 'new';
export const APPLICATION_STATE_APPROVED = 'approved';
export const APPLICATION_STATE_REJECTED = 'rejected';

export const INITIAL_ELEVATION = 1;
export const FINAL_ELEVATION = 8;
