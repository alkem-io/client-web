import { useCookies } from 'react-cookie';

export const ALKEMIO_COOKIE_NAME = 'accepted_cookies';
export const AlkemioCookieTypes = {
  technical: 'technical',
  analysis: 'analysis',
};
const MANDATORY_COOKIES = [AlkemioCookieTypes.technical];
const ALL_COOKIES = [...Object.values(AlkemioCookieTypes)];

const createCookieOptions = () => {
  const date = new Date();
  date.setDate(date.getDate() + 150);
  return { expires: date, path: '/' };
};

export const useAlkemioCookies = () => {
  const [, setCookie] = useCookies([ALKEMIO_COOKIE_NAME]);

  const acceptAllCookies = () => {
    const options = createCookieOptions();
    setCookie(ALKEMIO_COOKIE_NAME, JSON.stringify(ALL_COOKIES), options);
  };

  const acceptOnlySelected = (selectedCookies: string[]) => {
    const cookies = new Set([...MANDATORY_COOKIES, ...selectedCookies]);
    const options = createCookieOptions();
    setCookie(ALKEMIO_COOKIE_NAME, JSON.stringify([...cookies]), options);
  };

  return { acceptAllCookies, acceptOnlySelected };
};
