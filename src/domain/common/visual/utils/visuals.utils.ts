import { Profile, Visual } from '@core/apollo/generated/graphql-schema';
import { VisualName } from '../constants/visuals.constants';

type VisualNameAndUri = Pick<Visual, 'name' | 'uri'>;
type ProfileWithVisualNameAndUri = { visuals: Pick<Visual, 'name' | 'uri'>[] };

export function getVisualAvatar(profile?: ProfileWithVisualNameAndUri): string | undefined;
export function getVisualAvatar(vis?: VisualNameAndUri[]): string | undefined;
export function getVisualAvatar(vis?: VisualNameAndUri): string | undefined;
export function getVisualAvatar(profileOrVisual?: unknown): string | undefined {
  return _getVisualByType(VisualName.AVATAR, profileOrVisual)?.uri;
}

export function getVisualBanner(profile?: ProfileWithVisualNameAndUri): string | undefined;
export function getVisualBanner(vis?: VisualNameAndUri[]): string | undefined;
export function getVisualBanner(vis?: VisualNameAndUri): string | undefined;
export function getVisualBanner(a?: unknown): string | undefined {
  return _getVisualByType(VisualName.BANNER, a)?.uri;
}

export function getVisualCardBanner(profile?: ProfileWithVisualNameAndUri): string | undefined;
export function getVisualCardBanner(vis?: VisualNameAndUri[]): string | undefined;
export function getVisualCardBanner(vis?: VisualNameAndUri): string | undefined;
export function getVisualCardBanner(profileOrVisual?: unknown): string | undefined {
  return _getVisualByType(VisualName.CARD, profileOrVisual)?.uri;
}

export function getVisualByType(type: VisualName, profile?: ProfileWithVisualNameAndUri): Visual | undefined;
export function getVisualByType(type: VisualName, vis?: VisualNameAndUri[]): Visual | undefined;
export function getVisualByType(type: VisualName, vis?: VisualNameAndUri): Visual | undefined;
export function getVisualByType(type: VisualName, profileOrVisual?: unknown): Visual | undefined {
  return _getVisualByType(type, profileOrVisual);
}

const _getVisualByType = (type: VisualName, profileOrVisual?: unknown): Visual | undefined => {
  if (!profileOrVisual) {
    return undefined;
  }

  if (isProfile(profileOrVisual)) {
    return profileOrVisual.visuals?.find(x => x.name === type);
  } else if (isVisualArray(profileOrVisual)) {
    return profileOrVisual.find(x => x.name === type);
  } else if (isVisual(profileOrVisual)) {
    return profileOrVisual.name === type ? profileOrVisual : undefined;
  } else {
    return undefined;
  }
};

const isProfile = (profile: unknown): profile is Profile => !!(profile as Profile)?.visuals;
const isVisualArray = (vis: unknown): vis is Visual[] => Array.isArray(vis) && !!(vis as Visual[])?.[0]?.name;
const isVisual = (vis: unknown): vis is Visual => !!(vis as Visual)?.name;
