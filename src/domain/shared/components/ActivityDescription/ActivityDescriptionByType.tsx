import { useTranslation } from 'react-i18next';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';

interface ActivityDescriptionByTypeProps {
  activityType: ActivityEventType;
  subject: string;
}

const ActivityDescriptionByType = ({ activityType, subject }: ActivityDescriptionByTypeProps) => {
  const { t } = useTranslation();

  return <>{t(`components.activityLogView.description.${activityType}` as const, { subject: subject })}</>;
};

export default ActivityDescriptionByType;
