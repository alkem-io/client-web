const getSubdomain = (hostname: string) => {
  const zones = hostname.split('.');
  if (zones.length < 3) {
    return undefined;
  }
  const [subdomain] = zones;
  return subdomain;
};

export default getSubdomain;
