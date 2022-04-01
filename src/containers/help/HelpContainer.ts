import { FC, useEffect, useState } from 'react';
import { HelpApi } from '../../api/HelpApi';
import { ComponentOrChildrenFn, renderComponentOrChildrenFn } from '../../utils/containers/ComponentOrChildrenFn';

export interface HelpContainerProvided {
  helpTextMd: string | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

interface HelpContainerProps {
  helpApi: HelpApi;
}

const HelpContainer: FC<HelpContainerProps & ComponentOrChildrenFn<HelpContainerProvided>> = ({ helpApi, ...rest }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [helpTextMd, setHelpTextMd] = useState<string>();
  const [error, setError] = useState<Error>();

  const requestHelp = async () => {
    try {
      setIsLoading(true);
      const helpText = await helpApi.getHelpTextMd();
      setHelpTextMd(helpText);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestHelp();
  }, []);

  const provided: HelpContainerProvided = {
    helpTextMd,
    isLoading,
    error,
  };

  return renderComponentOrChildrenFn(rest, provided);
};

export default HelpContainer;
