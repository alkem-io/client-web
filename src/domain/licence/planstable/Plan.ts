export enum Plan {
  FREE = 'FREE',
  PLUS = 'PLUS',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

export const getPlanFromId = (plan: string): Plan | undefined => {
  switch (plan) {
    case 'FREE':
      return Plan.FREE;
    case 'PLUS':
      return Plan.PLUS;
    case 'PREMIUM':
      return Plan.PREMIUM;
    case 'ENTERPRISE':
      return Plan.ENTERPRISE;
    default:
      return undefined;
  }
};
