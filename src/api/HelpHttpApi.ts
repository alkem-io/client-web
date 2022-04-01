import { HelpApi } from './HelpApi';

const getHelpTextMd = async () => {
  const response = await fetch('/help.md');
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.text();
};

const helpHttpApi: HelpApi = {
  getHelpTextMd,
};

export default helpHttpApi;
