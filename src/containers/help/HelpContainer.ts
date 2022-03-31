import { FC, useEffect, useState } from 'react';
import { HelpApi } from '../../api/HelpApi';
import { ComponentOrChildrenFn, renderComponentOrChildrenFn } from '../../utils/containers/ComponentOrChildrenFn';

export interface HelpContainerProvided {
  helpTextMd: string | undefined;
  isLoading: boolean;
}

interface HelpContainerProps {
  helpApi: HelpApi;
}

const HelpContainer: FC<HelpContainerProps & ComponentOrChildrenFn<HelpContainerProvided>> = ({ helpApi, ...rest }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [helpTextMd, setHelpTextMd] = useState<string>();

  const requestHelp = async () => {
    try {
      setIsLoading(true);
      const helpText = await helpApi.getHelpTextMd();
      setHelpTextMd(helpText);
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
  };

  return renderComponentOrChildrenFn(rest, provided);
};

export default HelpContainer;
