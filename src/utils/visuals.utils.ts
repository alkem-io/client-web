import { Context, Visual2 } from '../models/graphql-schema';
import { VisualName } from '../models/constants/visuals.constants';

type VisualNameAndUri = Pick<Visual2, 'name' | 'uri'>;
type ContextWithVisualNameAndUri = { visuals: Pick<Visual2, 'name' | 'uri'>[] };

export function getVisualAvatar(ctx?: ContextWithVisualNameAndUri): string | undefined;
export function getVisualAvatar(vis?: VisualNameAndUri[]): string | undefined;
export function getVisualAvatar(vis?: VisualNameAndUri): string | undefined;
export function getVisualAvatar(ctxOrVis?: unknown): string | undefined {
  return getVisualByType(VisualName.AVATAR, ctxOrVis);
}

export function getVisualBanner(ctx?: ContextWithVisualNameAndUri): string | undefined;
export function getVisualBanner(vis?: VisualNameAndUri[]): string | undefined;
export function getVisualBanner(vis?: VisualNameAndUri): string | undefined;
export function getVisualBanner(a?: unknown): string | undefined {
  return getVisualByType(VisualName.BANNER, a);
}

export function getVisualBannerNarrow(ctx?: ContextWithVisualNameAndUri): string | undefined;
export function getVisualBannerNarrow(vis?: VisualNameAndUri[]): string | undefined;
export function getVisualBannerNarrow(vis?: VisualNameAndUri): string | undefined;
export function getVisualBannerNarrow(ctxOrVis?: unknown): string | undefined {
  return getVisualByType(VisualName.BANNERNARROW, ctxOrVis);
}

const getVisualByType = (type: VisualName, ctxOrVis?: unknown): string | undefined => {
  if (!ctxOrVis) {
    return undefined;
  }

  if (isContext(ctxOrVis)) {
    return (ctxOrVis as Context).visuals?.find(x => x.name === type)?.uri;
  } else if (isVisualArray(ctxOrVis)) {
    return (ctxOrVis as Visual2[]).find(x => x.name === type)?.uri;
  } else if (isVisual(ctxOrVis)) {
    return (ctxOrVis as Visual2).name === type ? (ctxOrVis as Visual2)?.uri : undefined;
  } else {
    return undefined;
  }
};

const isContext = (ctx: unknown): ctx is Context => !!(ctx as Context)?.visuals;
const isVisualArray = (vis: unknown): vis is Visual2[] => Array.isArray(vis) && !!(vis as Visual2[])?.[0]?.name;
const isVisual = (vis: unknown): vis is Visual2 => !!(vis as Visual2)?.name;
