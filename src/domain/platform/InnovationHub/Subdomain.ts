export const getSubdomain = (hostname: string) => {
  const zones = hostname.split('.');
  if (zones.length < 3) {
    return undefined;
  }
  const [subdomain] = zones;
  return subdomain;
};

export const detectSubdomain = () => {
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP__DEV_SUBDOMAIN) {
    return process.env.REACT_APP__DEV_SUBDOMAIN;
  }
  return getSubdomain(window.location.hostname);
};
