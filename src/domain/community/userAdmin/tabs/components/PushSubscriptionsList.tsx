import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useMyPushSubscriptionsQuery,
  useUnsubscribeFromPushNotificationsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { Caption } from '@/core/ui/typography/components';

function parseUserAgent(userAgent: string | null | undefined): string {
  if (!userAgent) return '';

  // Extract browser name
  let browser = '';
  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edg')) browser = 'Edge';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else browser = 'Browser';

  // Extract OS — check mobile platforms before desktop to avoid misidentification
  // (Android UA contains "Linux", iOS Safari contains "Mac OS X")
  let os = '';
  if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod')) os = 'iOS';
  else if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';

  return os ? `${browser} on ${os}` : browser;
}

export const PushSubscriptionsList = () => {
  const { t } = useTranslation();
  const { data, loading, refetch } = useMyPushSubscriptionsQuery();
  const [unsubscribeMutation] = useUnsubscribeFromPushNotificationsMutation();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const subscriptions = data?.myPushSubscriptions ?? [];
  const currentSubscriptionId = localStorage.getItem('alkemio_push_subscription_id');

  if (loading) return null;

  if (subscriptions.length === 0) {
    return (
      <Box sx={{ mt: 1 }}>
        <Caption>{t('pages.userNotificationsSettings.push.deviceManagement.emptyState')}</Caption>
      </Box>
    );
  }

  const handleRemove = async (subscriptionId: string) => {
    await unsubscribeMutation({
      variables: { subscriptionData: { subscriptionID: subscriptionId } },
    });
    setConfirmingId(null);
    await refetch();
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Caption sx={{ mb: 1 }}>{t('pages.userNotificationsSettings.push.deviceManagement.title')}</Caption>
      {subscriptions.map(sub => {
        const isCurrentDevice = sub.id === currentSubscriptionId;
        const deviceLabel =
          parseUserAgent(sub.userAgent) || t('pages.userNotificationsSettings.push.deviceManagement.unknownDevice');
        const createdDate = sub.createdDate ? new Date(sub.createdDate).toLocaleDateString() : '';
        const isConfirming = confirmingId === sub.id;

        return (
          <Box
            key={sub.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 0.5,
              px: 1,
              borderRadius: 1,
              bgcolor: isCurrentDevice ? 'action.hover' : 'transparent',
            }}
          >
            <Box>
              <Typography variant="body2">
                {deviceLabel}
                {isCurrentDevice && (
                  <Typography component="span" variant="body2" color="primary" sx={{ ml: 1 }}>
                    ({t('pages.userNotificationsSettings.push.deviceManagement.currentDevice')})
                  </Typography>
                )}
              </Typography>
              {createdDate && (
                <Typography variant="caption" color="text.secondary">
                  {createdDate}
                </Typography>
              )}
            </Box>
            {!isCurrentDevice && (
              <>
                {isConfirming ? (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="caption">
                      {t('pages.userNotificationsSettings.push.deviceManagement.removeConfirmation')}
                    </Typography>
                    <Button size="small" color="error" onClick={() => handleRemove(sub.id)}>
                      {t('pages.userNotificationsSettings.push.deviceManagement.removeDevice')}
                    </Button>
                    <Button size="small" onClick={() => setConfirmingId(null)}>
                      {t('buttons.cancel')}
                    </Button>
                  </Box>
                ) : (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setConfirmingId(sub.id)}
                    aria-label={`${t('pages.userNotificationsSettings.push.deviceManagement.removeDevice')} ${deviceLabel}`}
                  >
                    {t('pages.userNotificationsSettings.push.deviceManagement.removeDevice')}
                  </Button>
                )}
              </>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
