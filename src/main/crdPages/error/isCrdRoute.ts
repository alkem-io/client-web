import { reservedTopLevelRoutePaths } from '@/main/routing/TopLevelRoutePath';

export function isCrdRoute(pathname: string): boolean {
  if (!pathname) {
    return false;
  }

  let normalized = pathname.split('?')[0].split('#')[0];

  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  if (normalized === '' || normalized === '/') {
    return false;
  }

  if (normalized === '/home' || normalized === '/spaces' || normalized === '/restricted') {
    return true;
  }

  if (normalized.startsWith('/public/whiteboard/')) {
    return true;
  }

  const firstSegment = normalized.split('/')[1];

  if (firstSegment && !reservedTopLevelRoutePaths.includes(firstSegment)) {
    return true;
  }

  return false;
}
