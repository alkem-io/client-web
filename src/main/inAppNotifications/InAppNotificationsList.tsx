import { useInAppNotifications } from './useInAppNotifications';
import { InAppNotificationItem } from './InAppNotificationItem';

export const InAppNotificationsList = () => {
  const { items } = useInAppNotifications();

  return (
    <>
      {items.map(item => (
        <InAppNotificationItem key={`${item.id}-notificaion`} {...item} />
      ))}
    </>
  );
};
