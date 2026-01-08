import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { PropsWithChildren } from 'react';
import { gutters } from '@/core/ui/grid/utils';

interface CalloutContributionsBlockProps extends PropsWithChildren {}

const CalloutContributionsBlock = ({ children }: CalloutContributionsBlockProps) => {
  return <PageContentBlock sx={{ margin: gutters(1), width: 'auto' }}>{children}</PageContentBlock>;
};

export default CalloutContributionsBlock;
