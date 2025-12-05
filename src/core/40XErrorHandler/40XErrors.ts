import { UrlType } from '../apollo/generated/graphql-schema';

export interface ClosestAncestor {
  url: string;
  type: UrlType;
  space?: {
    id: string;
  };
}

export class NotFoundError extends Error {
  public closestAncestor?: ClosestAncestor;
  public redirectUrl?: string;
  constructor(params?: { redirectUrl?: string; closestAncestor?: ClosestAncestor }) {
    super('Not Found');
    this.closestAncestor = params?.closestAncestor;
    this.redirectUrl = params?.redirectUrl;
  }
}

export class NotAuthorizedError extends Error {
  public closestAncestor?: ClosestAncestor;
  public redirectUrl?: string;
  constructor(params?: { redirectUrl?: string; closestAncestor?: ClosestAncestor }) {
    super('Not Authorized');
    this.closestAncestor = params?.closestAncestor;
    this.redirectUrl = params?.redirectUrl;
  }
}
