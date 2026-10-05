import { useApolloClient } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCalloutFormResponsesQuery,
  useDeleteCalloutFormResponseMutation,
  useSubmitCalloutFormResponseMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutFormResponseVisibility,
  CalloutFormState,
} from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { CalloutFormBox } from '@/crd/components/callout/CalloutFormBox';
import { CalloutFormFillIn } from '@/crd/components/callout/CalloutFormFillIn';
import { CalloutFormOwnResponses, type OwnFormResponseView } from '@/crd/components/callout/CalloutFormOwnResponses';
import { CalloutFormResponseDialog } from '@/crd/components/callout/CalloutFormResponseDialog';
import { CalloutFormResponsesTable } from '@/crd/components/callout/CalloutFormResponsesTable';
import { deriveFormColumns } from '@/crd/components/callout/calloutFormColumns';
import type { FormAnswerInput } from '@/crd/components/callout/calloutFormTypes';
import { cn } from '@/crd/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/crd/primitives/dialog';
import { Separator } from '@/crd/primitives/separator';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import type {
  CalloutFormDetailsModel,
  CalloutFormResponseModel,
} from '@/domain/collaboration/callout-form/models/CalloutFormModels';
import { CalloutFormErrorCode, getCalloutFormError } from '@/domain/collaboration/callout-form/utils/calloutFormErrors';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { mapFormQuestionsToViews, mapFormResponseToView } from './calloutFormResponseMapper';
import { translateFormSubmitError } from './translateFormSubmitError';

const RESPONSES_PAGE_SIZE = 50;

type CalloutFramingFormConnectorProps = {
  callout: CalloutDetailsModelExtended;
  className?: string;
};

/**
 * Renders a Form callout: the fill-in (or the viewer's own responses), and — for viewers who may read
 * every response — the review entry point. The definition arrives with the callout; responses are read
 * only through the dedicated root lookup, never from the callout data.
 */
export function CalloutFramingFormConnector({ callout, className }: CalloutFramingFormConnectorProps) {
  const form = callout.framing.form;
  if (!form) return null;
  return <CalloutFramingFormConnectorInner callout={callout} form={form} className={className} />;
}

const toVisibilityValue = (visibility: CalloutFormResponseVisibility) =>
  visibility === CalloutFormResponseVisibility.Members ? 'MEMBERS' : 'ADMINS';

function CalloutFramingFormConnectorInner({
  callout,
  form,
  className,
}: {
  callout: CalloutDetailsModelExtended;
  form: CalloutFormDetailsModel;
  className?: string;
}) {
  const { t } = useTranslation('crd-space');
  const notify = useNotification();
  const client = useApolloClient();
  const { space } = useSpace();
  const { subspace } = useSubSpace();
  // The notice names the space that reads the responses: the exact (sub)space the callout lives in.
  const spaceName = subspace.about.profile.displayName || space.about.profile.displayName;

  const visibility = toVisibilityValue(form.settings.visibility);
  const isOpen = form.settings.state === CalloutFormState.Open;
  const isSingle = form.settings.responseMode === 'SINGLE';
  const published = !callout.draft;
  const hasContribute = callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Contribute) ?? false;
  const canSubmit = hasContribute && published && isOpen;

  // One page is enough here: the count, the viewer's own responses and the scope flags. The review dialog
  // loads its own, larger pages.
  const { data, error, refetch, fetchMore } = useCalloutFormResponsesQuery({
    variables: { formID: form.id, first: 1 },
    fetchPolicy: 'cache-and-network',
  });
  const responses = data?.lookup.calloutFormResponses;

  const [submitResponse, { loading: submitting }] = useSubmitCalloutFormResponseMutation();
  const [deleteResponse, { loading: deleting }] = useDeleteCalloutFormResponseMutation();
  const [fillInKey, setFillInKey] = useState(0);
  // A submission has succeeded but `mine` has not been reloaded yet: the fill-in stays locked until it has,
  // so a single-response form cannot be submitted a second time in that window.
  const [settling, setSettling] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  // Earlier own responses than `mine` carries (it holds only the newest page), paged from `all` oldest-first.
  // Only for viewers whose `all` is scoped to their own responses; a reader of every response uses the review.
  const [earlier, setEarlier] = useState<LoadedPage | null>(null);
  const [loadingEarlier, setLoadingEarlier] = useState(false);

  const questions = mapFormQuestionsToViews(form);
  const mine = responses?.mine ?? [];
  const ownScoped = responses ? !responses.canReadAll : false;
  const ownTotal = ownScoped ? (responses?.all.total ?? 0) : mine.length;
  const mineIds = new Set(mine.map(response => response.id));
  const earlierResponses = ownScoped ? (earlier?.responses ?? []) : [];
  // `mine` is the newest of the viewer's responses, so its first entry is number ownTotal - mine.length + 1.
  const mineOffset = Math.max(ownTotal - mine.length, 0);
  const ownResponses: OwnFormResponseView[] = [
    ...earlierResponses
      .map((response, index) => ({ ...mapFormResponseToView(response), number: index + 1 }))
      .filter(response => !mineIds.has(response.id)),
    ...mine.map((response, index) => ({ ...mapFormResponseToView(response), number: mineOffset + index + 1 })),
  ];
  const hasEarlier = ownScoped && ownResponses.length < ownTotal && (earlier?.hasNextPage ?? true);

  const handleLoadEarlier = async () => {
    if (loadingEarlier) return;
    setLoadingEarlier(true);
    try {
      const result = await fetchMore({
        variables: { formID: form.id, first: RESPONSES_PAGE_SIZE, after: earlier?.endCursor },
      });
      const page = result.data.lookup.calloutFormResponses.all;
      setEarlier(previous => ({
        responses: [...(previous?.responses ?? []), ...page.responses],
        hasNextPage: page.pageInfo.hasNextPage,
        endCursor: page.pageInfo.endCursor ?? undefined,
      }));
    } catch (err) {
      logError(new Error('Own form responses page load failed', { cause: err as Error }));
      notify(t('formResponses.loadFailed'), 'error');
    } finally {
      setLoadingEarlier(false);
    }
  };

  const refreshResponses = async () => {
    setReviewRefreshKey(key => key + 1);
    // A submission or withdrawal shifts the pages: start the earlier list over.
    setEarlier(null);
    await refetch();
  };

  /**
   * The definition and settings live on the callout; refetch them so the rendered notice is current. Only
   * this callout's details query is refetched — not every callout on the page.
   */
  const refreshDefinition = async () => {
    await client.refetchQueries({
      include: ['CalloutDetails'],
      onQueryUpdated: query => query.variables?.calloutId === callout.id,
    });
  };

  const handleSubmit = async (answers: FormAnswerInput[]) => {
    setServerErrors({});
    try {
      await submitResponse({
        variables: {
          responseData: {
            formID: form.id,
            // Exactly the visibility the notice on screen names: the server rejects the submission when
            // the form has since been opened to a wider audience than the respondent saw.
            acknowledgedVisibility:
              visibility === 'MEMBERS' ? CalloutFormResponseVisibility.Members : CalloutFormResponseVisibility.Admins,
            answers: answers.map(answer => ({
              questionID: answer.questionID,
              text: answer.text,
              selectedOptionIDs: answer.selectedOptionIDs,
            })),
          },
        },
        context: { skipGlobalErrorHandler: true },
      });
    } catch (err) {
      const rejection = getCalloutFormError(err);
      logError(new Error('Form response submission failed', { cause: err as Error }));
      // Whatever the reason, the form may have changed under the respondent: reload the definition and
      // the viewer's responses so the notice and the branch shown are current. The draft answers stay,
      // because the fill-in keeps its own state across these refetches.
      await Promise.allSettled([refreshDefinition(), refreshResponses()]);
      notify(
        translateFormSubmitError(rejection?.code, t),
        rejection?.code === CalloutFormErrorCode.FORM_VISIBILITY_CHANGED ? 'warning' : 'error'
      );
      if (rejection?.questionIDs.length) {
        const message = translateFormSubmitError(rejection.code, t);
        setServerErrors(Object.fromEntries(rejection.questionIDs.map(id => [id, message])));
      }
      return;
    }
    notify(t('formFillIn.success'), 'success');
    setSettling(true);
    // Reload `mine` before the fill-in is reset: in single-response mode it then gives way to the response,
    // instead of remounting empty and submittable for a second, rejected attempt.
    await Promise.allSettled([refreshResponses()]);
    setFillInKey(key => key + 1);
    setSettling(false);
  };

  const handleDelete = async (responseId: string, ownership: 'own' | 'moderated') => {
    try {
      await deleteResponse({
        variables: { deleteData: { responseID: responseId } },
        context: { skipGlobalErrorHandler: true },
      });
      if (ownership === 'own') notify(t('formFillIn.withdrawn'), 'success');
      await refreshResponses();
    } catch (err) {
      logError(new Error('Form response deletion failed', { cause: err as Error }));
      notify(ownership === 'own' ? t('formFillIn.withdrawFailed') : t('formResponses.deleteFailed'), 'error');
    }
  };

  if (!responses) {
    return error ? (
      <p className={cn('text-caption text-muted-foreground', className)}>{t('formResponses.loadFailed')}</p>
    ) : null;
  }

  const showOwnResponses = ownResponses.length > 0;
  // One response per person: once the viewer holds any response, the fill-in gives way to every one of them
  // (a member may hold several after a switch from multiple responses); it returns once they hold none.
  const showFillIn = !(isSingle && showOwnResponses);
  const formTitle = form.title?.trim() || t('formFillIn.untitled');

  return (
    <CalloutFormBox
      className={className}
      title={form.title ?? undefined}
      description={form.description ?? undefined}
      questionCount={questions.length}
      visibility={visibility}
      spaceName={spaceName}
      status={!published ? 'DRAFT' : isOpen ? undefined : 'CLOSED'}
      defaultCollapsed={form.settings.defaultCollapsed}
      onViewResponses={responses.canReadAll ? () => setReviewOpen(true) : undefined}
      responseCount={responses.all.total}
    >
      {showOwnResponses && (
        <CalloutFormOwnResponses
          responses={ownResponses}
          questions={questions}
          onWithdraw={id => void handleDelete(id, 'own')}
          withdrawing={deleting}
          status={showFillIn ? undefined : !published ? 'DRAFT' : isOpen ? undefined : 'CLOSED'}
          onLoadEarlier={hasEarlier ? () => void handleLoadEarlier() : undefined}
          loadingEarlier={loadingEarlier}
        />
      )}
      {showOwnResponses && showFillIn && <Separator />}
      {showFillIn && (
        <CalloutFormFillIn
          key={`fill-in-${fillInKey}`}
          questions={questions}
          state={isOpen ? 'OPEN' : 'CLOSED'}
          published={published}
          canSubmit={canSubmit}
          submitting={submitting || settling}
          errors={serverErrors}
          onSubmit={answers => void handleSubmit(answers)}
        />
      )}

      {responses.canReadAll && (
        <FormResponsesReviewDialog
          // A change to the responses (a submission, a deletion) remounts the dialog so it reloads from page one.
          key={`review-${reviewRefreshKey}`}
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          formId={form.id}
          formTitle={formTitle}
          questions={questions}
          canModerate={responses.canModerate}
          onDelete={id => handleDelete(id, 'moderated')}
          deletedUserLabel={t('formResponses.deletedUser')}
        />
      )}
    </CalloutFormBox>
  );
}

type FormResponsesReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  /** The Form title (or the generic "Form"), shown as the heading context of the review. */
  formTitle: string;
  questions: ReturnType<typeof mapFormQuestionsToViews>;
  canModerate: boolean;
  onDelete: (responseId: string) => Promise<void>;
  deletedUserLabel: string;
};

type LoadedPage = {
  responses: CalloutFormResponseModel[];
  hasNextPage: boolean;
  endCursor: string | undefined;
};

function FormResponsesReviewDialog({
  open,
  onOpenChange,
  formId,
  formTitle,
  questions,
  canModerate,
  onDelete,
  deletedUserLabel,
}: FormResponsesReviewDialogProps) {
  const { t } = useTranslation('crd-space');
  const [openResponseId, setOpenResponseId] = useState<string | null>(null);
  const [extraPages, setExtraPages] = useState<LoadedPage[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, error, fetchMore } = useCalloutFormResponsesQuery({
    variables: { formID: formId, first: RESPONSES_PAGE_SIZE },
    skip: !open,
    fetchPolicy: 'network-only',
  });

  const firstPage = data?.lookup.calloutFormResponses.all;
  const loadedResponses: CalloutFormResponseModel[] = [
    ...(firstPage?.responses ?? []),
    ...extraPages.flatMap(page => page.responses),
  ];
  const lastExtra = extraPages.length > 0 ? extraPages[extraPages.length - 1] : undefined;
  const hasMore = lastExtra ? lastExtra.hasNextPage : Boolean(firstPage?.pageInfo.hasNextPage);
  const cursor = lastExtra ? lastExtra.endCursor : (firstPage?.pageInfo.endCursor ?? undefined);

  const handleLoadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchMore({ variables: { formID: formId, first: RESPONSES_PAGE_SIZE, after: cursor } });
      const page = result.data.lookup.calloutFormResponses.all;
      setExtraPages(pages => [
        ...pages,
        {
          responses: page.responses,
          hasNextPage: page.pageInfo.hasNextPage,
          endCursor: page.pageInfo.endCursor ?? undefined,
        },
      ]);
    } catch (err) {
      logError(new Error('Form responses page load failed', { cause: err as Error }));
    } finally {
      setLoadingMore(false);
    }
  };

  const responseViews = loadedResponses.map(mapFormResponseToView);
  const columns = deriveFormColumns(questions, responseViews);
  const openResponse = responseViews.find(response => response.id === openResponseId) ?? null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="shrink-0 space-y-0.5">
            <p className="text-caption text-muted-foreground break-words">{formTitle}</p>
            <DialogTitle className="text-subsection-title">{t('formResponses.dialogTitle')}</DialogTitle>
          </div>
          <Separator className="shrink-0" />
          <div className="flex-1 min-h-0 overflow-y-auto">
            {error && !firstPage ? (
              <p className="text-body text-muted-foreground">{t('formResponses.loadFailed')}</p>
            ) : loading && !firstPage ? null : (
              <CalloutFormResponsesTable
                columns={columns}
                responses={responseViews}
                total={data?.lookup.calloutFormResponses.all.total ?? 0}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={() => void handleLoadMore()}
                canModerate={canModerate}
                onDelete={id => void onDelete(id)}
                onOpen={setOpenResponseId}
                deletedUserLabel={deletedUserLabel}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <CalloutFormResponseDialog
        open={openResponse !== null}
        onOpenChange={next => {
          if (!next) setOpenResponseId(null);
        }}
        response={openResponse}
        formTitle={formTitle}
        columns={columns}
        canModerate={canModerate}
        onDelete={id => void onDelete(id)}
        deletedUserLabel={deletedUserLabel}
      />
    </>
  );
}
