import { FC } from 'react';

interface ActivityLogEntryProps {
  avatarUrl: string;
  createdDate: Date;
  triggeredByFullName: string;
  title: string;
  subtitle: string;
}

const ActivityLogEntry: FC<ActivityLogEntryProps> = () => {
  return <>this is ActivityLogEntry</>;
};
