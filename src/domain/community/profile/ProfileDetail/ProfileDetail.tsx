import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockTitle } from '@/core/ui/typography';

type ProfileDetailProps = {
  title: string;
  value?: string;
};

const ProfileDetail = ({ title, value = '' }: ProfileDetailProps) => (
  <>
    <BlockTitle>{title}</BlockTitle>
    <WrapperMarkdown>{value}</WrapperMarkdown>
  </>
);

export default ProfileDetail;
