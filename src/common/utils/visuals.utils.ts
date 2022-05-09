import { Context, Visual } from '../../models/graphql-schema';
import { VisualName } from '../../models/constants/visuals.constants';

type VisualNameAndUri = Pick<Visual, 'name' | 'uri'>;
type ContextWithVisualNameAndUri = { visuals: Pick<Visual, 'name' | 'uri'>[] };

export function getVisualAvatar(ctx?: ContextWithVisualNameAndUri): string | undefined;
export function getVisualAvatar(vis?: VisualNameAndUri[]): string | undefined;
export function getVisualAvatar(vis?: VisualNameAndUri): string | undefined;
export function getVisualAvatar(ctxOrVis?: unknown): string | undefined {
  return _getVisualByType(VisualName.AVATAR, ctxOrVis)?.uri;
}

export function getVisualBanner(ctx?: ContextWithVisualNameAndUri): string | undefined;
export function getVisualBanner(vis?: VisualNameAndUri[]): string | undefined;
export function getVisualBanner(vis?: VisualNameAndUri): string | undefined;
export function getVisualBanner(a?: unknown): string | undefined {
  return _getVisualByType(VisualName.BANNER, a)?.uri;
}

export function getVisualBannerNarrow(ctx?: ContextWithVisualNameAndUri): string | undefined;
export function getVisualBannerNarrow(vis?: VisualNameAndUri[]): string | undefined;
export function getVisualBannerNarrow(vis?: VisualNameAndUri): string | undefined;
export function getVisualBannerNarrow(ctxOrVis?: unknown): string | undefined {
  return _getVisualByType(VisualName.BANNERNARROW, ctxOrVis)?.uri;
}

export function getVisualByType(type: VisualName, ctx?: ContextWithVisualNameAndUri): Visual | undefined;
export function getVisualByType(type: VisualName, vis?: VisualNameAndUri[]): Visual | undefined;
export function getVisualByType(type: VisualName, vis?: VisualNameAndUri): Visual | undefined;
export function getVisualByType(type: VisualName, ctxOrVis?: unknown): Visual | undefined {
  return _getVisualByType(type, ctxOrVis);
}

const _getVisualByType = (type: VisualName, ctxOrVis?: unknown): Visual | undefined => {
  if (!ctxOrVis) {
    return undefined;
  }

  if (isContext(ctxOrVis)) {
    return (ctxOrVis as Context).visuals?.find(x => x.name === type);
  } else if (isVisualArray(ctxOrVis)) {
    return (ctxOrVis as Visual[]).find(x => x.name === type);
  } else if (isVisual(ctxOrVis)) {
    return (ctxOrVis as Visual).name === type ? (ctxOrVis as Visual) : undefined;
  } else {
    return undefined;
  }
};

const isContext = (ctx: unknown): ctx is Context => !!(ctx as Context)?.visuals;
const isVisualArray = (vis: unknown): vis is Visual[] => Array.isArray(vis) && !!(vis as Visual[])?.[0]?.name;
const isVisual = (vis: unknown): vis is Visual => !!(vis as Visual)?.name;
