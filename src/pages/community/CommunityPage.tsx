import { FC } from 'react';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';

interface Props extends PageProps {}

const CommunityPage: FC<Props> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });
  return <>This is community page</>;
};
export default CommunityPage;
