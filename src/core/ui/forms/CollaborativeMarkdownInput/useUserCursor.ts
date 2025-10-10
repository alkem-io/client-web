import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useTranslation } from 'react-i18next';

const colors = {
  '0': '#958DF1',
  '1': '#F98181',
  '2': '#FBBC88',
  '3': '#FAF594',
  '4': '#70CFF8',
  '5': '#94FADB',
  '6': '#B9F18D',
  '7': '#C3E2C2',
  '8': '#EAECCC',
  '9': '#AFC8AD',
  a: '#EEC759',
  b: '#9BB8CD',
  c: '#FF90BC',
  d: '#FFC0D9',
  e: '#DC8686',
  f: '#7ED7C1',
  default: '#F3EEEA',
} as const;

const useUserCursor = () => {
  const { t } = useTranslation();
  const { userModel } = useCurrentUserContext();
  const userIdFirstChar = userModel?.id[0]?.toLowerCase() ?? '0';

  const userId = userModel?.profile.id;
  const userName = userModel?.profile.displayName ?? t('common.anonymous');
  const cursorColor = colors[userIdFirstChar] ?? colors.default;

  return {
    userId,
    userName,
    cursorColor,
  };
};

export default useUserCursor;
