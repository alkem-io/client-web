import { useCookies } from 'react-cookie';

export const COOKIE_NAME = 'accepted_cookies';
const CookieTypes = {
  technical: 'technical',
  analysis: 'analysis',
};
const MANDATORY_COOKIES = [CookieTypes.technical];
const ALL_COOKIES = [...Object.values(CookieTypes)];

const createCookieOptions = () => {
  const date = new Date();
  date.setDate(date.getDate() + 150);
  return { expires: date };
};

export const useAlkemioCookies = () => {
  const [, setCookie] = useCookies([COOKIE_NAME]);

  const acceptAllCookies = () => {
    const options = createCookieOptions();
    setCookie(COOKIE_NAME, JSON.stringify(ALL_COOKIES), options);
  };

  const acceptOnlySelected = (selectedCookies: string[]) => {
    const cookies = new Set([...MANDATORY_COOKIES, ...selectedCookies]);
    const options = createCookieOptions();
    setCookie(COOKIE_NAME, JSON.stringify([...cookies]), options);
  };

  return { acceptAllCookies, acceptOnlySelected };
};
