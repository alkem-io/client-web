import { useConfig } from '@/domain/platform/config/useConfig';

const getLandingUrl = ({ host }: { host: string }) => `//welcome.${host}/`;

const useLandingUrl = () => {
  const { locations } = useConfig();

  return locations && getLandingUrl({ host: locations.domain });
};

export default useLandingUrl;
