import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { error as sentryError, TagCategoryValues } from '@/core/logging/sentry/log';
import useNavigate from '@/core/routing/useNavigate';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { CrdForbiddenPage } from '@/crd/components/error/CrdForbiddenPage';
import { CrdGenericErrorContent } from '@/main/crdPages/error/CrdGenericErrorContent';
import { CrdNotFoundBranch } from '@/main/crdPages/error/CrdNotFoundBranch';
import { hasInAppHistory } from '@/main/crdPages/error/hasInAppHistory';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';

export type CrdAwareErrorComponentProps = {
  hasError?: boolean;
  error?: Error;
  isNotFound?: boolean;
  isNotAuthorized?: boolean;
  pathname?: string;
};

export function CrdAwareErrorComponent(props: CrdAwareErrorComponentProps) {
  if (props.isNotAuthorized === true) {
    return <CrdForbiddenBranch />;
  }

  if (props.isNotFound === true) {
    return <CrdNotFoundBranch />;
  }

  if (props.error) {
    return <CrdGenericErrorBranch error={props.error} />;
  }

  return <CrdNotFoundBranch />;
}

function CrdForbiddenBranch() {
  const { t } = useTranslation('crd-error');
  const navigate = useNavigate();
  const showGoBack = hasInAppHistory();

  usePageTitle(t('forbidden.title'));

  return (
    <CrdLayoutWrapper>
      <CrdForbiddenPage
        title={t('forbidden.title')}
        description={t('forbidden.description')}
        goHomeLabel={t('forbidden.actions.goHome')}
        goBackLabel={t('forbidden.actions.goBack')}
        onGoHome={() => navigate(`/${TopLevelRoutePath.Home}`)}
        onGoBack={showGoBack ? () => navigate(-1) : undefined}
        showGoBack={showGoBack}
      />
    </CrdLayoutWrapper>
  );
}

function CrdGenericErrorBranch({ error }: { error: Error }) {
  const { t } = useTranslation('crd-error');

  usePageTitle(t('genericError.title'));

  // Safety net mirroring the MUI ErrorPage: ensure every render is tracked in
  // Sentry. Sentry deduplicates if the error was already captured upstream.
  useEffect(() => {
    sentryError(error, { category: TagCategoryValues.UI, label: 'CrdErrorPage' });
  }, [error]);

  return (
    <CrdLayoutWrapper>
      <CrdGenericErrorContent error={error} />
    </CrdLayoutWrapper>
  );
}
