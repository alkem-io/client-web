import { useApolloClient } from '@apollo/client';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useDeleteCalloutFormResponseMutation,
  useSubmitCalloutFormResponseMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  type CalloutFormQuestionType,
  CalloutFormResponseVisibility,
  CalloutFormState,
} from '@/core/apollo/generated/graphql-schema';
import type { PostBodyFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { CalloutFormBox } from '@/crd/components/callout/CalloutFormBox';
import { CalloutFormFillIn } from '@/crd/components/callout/CalloutFormFillIn';
import { CalloutFormOwnResponses, type OwnFormResponseView } from '@/crd/components/callout/CalloutFormOwnResponses';
import { CalloutFormResponseDialog } from '@/crd/components/callout/CalloutFormResponseDialog';
import { CalloutFormResponsesTable } from '@/crd/components/callout/CalloutFormResponsesTable';
import { deriveFormColumns } from '@/crd/components/callout/calloutFormColumns';
import type { FormAnswerInput } from '@/crd/components/callout/calloutFormTypes';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogTitle } from '@/crd/primitives/dialog';
import { Separator } from '@/crd/primitives/separator';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { useCachedPost } from '@/domain/collaboration/callout/useCalloutDetails/useCalloutDetails';
import type {
  CalloutFormAnswerModel,
  CalloutFormDetailsModel,
  CalloutFormResponseModel,
} from '@/domain/collaboration/callout-form/models/CalloutFormModels';
import { CalloutFormErrorCode, getCalloutFormError } from '@/domain/collaboration/callout-form/utils/calloutFormErrors';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useSpace } from '@/domain/space/context/useSpace';
import { usePostResponses } from '@/domain/space/hooks/useSpacePage';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { mapFormQuestionsToViews, mapFormResponseToView } from './calloutFormResponseMapper';
import { translateFormSubmitError } from './translateFormSubmitError';
import { useFormResponsesCsvExport } from './useFormResponsesCsvExport';

type FormContent = Extract<NonNullable<PostBodyFragment['content']>, { __typename: 'FormContent' }>;
/** A form response: its child post in the page's space tree (depth 2), its answers the FormResponseContent arm. */
type FormResponseNode = NonNullable<ReturnType<typeof usePostResponses>['responses']>[number];

/** 021 D11: one submitted response (its immutable answers snapshot) in the legacy response model. */
const toFormResponse = ({ id, createdAt, author, content }: FormResponseNode): CalloutFormResponseModel => ({
  id,
  createdDate: new Date(createdAt),
  createdBy: author && {
    id: author.id,
    profile: author.about && {
      id: author.id,
      displayName: author.about.displayName,
      url: author.url ?? '',
      avatar: author.about.avatar && { id: author.id, uri: author.about.avatar.file.url },
    },
  },
  answers: ((content && 'answers' in content ? content.answers : []) as CalloutFormAnswerModel[]).map(answer => ({
    ...answer,
    type: answer.type.toUpperCase() as CalloutFormQuestionType,
  })),
});

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

  // 021 D11: nothing is asked; the counts arrive with the post (FormContent) and the responses are the form's child
  // posts in the page's space tree (depth 2). Reading every response needs the read-all flag, not served yet (seed
  // batch 2), so the viewer's scope is their own responses: the rows they authored.
  const content = useCachedPost(callout.id)?.content as FormContent | null | undefined;
  const { userModel } = useCurrentUserContext();
  const formTree = usePostResponses(callout.calloutsSetId, callout.id);
  const formRows = formTree.responses;
  const responses = content && {
    mine: (formRows ?? []).filter(row => row.author?.id === userModel?.id).map(toFormResponse),
    canReadAll: false,
    canModerate: false,
    all: { total: content.myResponseCount },
  };

  const [submitResponse, { loading: submitting }] = useSubmitCalloutFormResponseMutation();
  const [deleteResponse, { loading: deleting }] = useDeleteCalloutFormResponseMutation();
  const [fillInKey, setFillInKey] = useState(0);
  // A submission has succeeded but `mine` has not been reloaded yet: the fill-in stays locked until it has,
  // so a single-response form cannot be submitted a second time in that window.
  const [settling, setSettling] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  const questions = mapFormQuestionsToViews(form);
  const mine = responses?.mine ?? [];
  const ownScoped = responses ? !responses.canReadAll : false;
  const ownTotal = ownScoped ? (responses?.all.total ?? 0) : mine.length;
  // `mine` holds every own response the space tree carries, so its first entry is number ownTotal - mine.length + 1.
  const mineOffset = Math.max(ownTotal - mine.length, 0);
  const ownResponses: OwnFormResponseView[] = mine.map((response, index) => ({
    ...mapFormResponseToView(response),
    number: mineOffset + index + 1,
  }));

  const refreshResponses = async () => {
    setReviewRefreshKey(key => key + 1);
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
    return null;
  }

  const showOwnResponses = ownResponses.length > 0;
  // The space tree (the form's responses) is not served yet: the viewer's own responses say so in place.
  const ownUnavailable = formTree.notServed && (content?.myResponseCount ?? 0) > 0;
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
      status={!published ? 'DRAFT' : isOpen ? undefined : 'CLOSED'}
      defaultCollapsed={form.settings.defaultCollapsed}
      onViewResponses={responses.canReadAll ? () => setReviewOpen(true) : undefined}
      responseCount={responses.all.total}
    >
      {ownUnavailable && <p className="text-body text-muted-foreground py-6 text-center">{t('tabs.unavailable')}</p>}
      {showOwnResponses && (
        <CalloutFormOwnResponses
          responses={ownResponses}
          questions={questions}
          onWithdraw={id => void handleDelete(id, 'own')}
          withdrawing={deleting}
          status={showFillIn ? undefined : !published ? 'DRAFT' : isOpen ? undefined : 'CLOSED'}
        />
      )}
      {showOwnResponses && showFillIn && <Separator />}
      {showFillIn && (
        <CalloutFormFillIn
          key={`fill-in-${fillInKey}`}
          questions={questions}
          visibility={visibility}
          spaceName={spaceName}
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
          spaceId={callout.calloutsSetId}
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
  /** The space whose tree carries the form's responses (its child posts). */
  spaceId: string | undefined;
  formId: string;
  /** The Form title (or the generic "Form"), shown as the heading context of the review. */
  formTitle: string;
  questions: ReturnType<typeof mapFormQuestionsToViews>;
  canModerate: boolean;
  onDelete: (responseId: string) => Promise<void>;
  deletedUserLabel: string;
};

function FormResponsesReviewDialog({
  open,
  onOpenChange,
  spaceId,
  formId,
  formTitle,
  questions,
  canModerate,
  onDelete,
  deletedUserLabel,
}: FormResponsesReviewDialogProps) {
  const { t } = useTranslation('crd-space');
  const [openResponseId, setOpenResponseId] = useState<string | null>(null);
  const { exportCsv, exporting } = useFormResponsesCsvExport({ formId, formTitle, questions });

  // Every response is a child post of the form in the page's space tree (depth 2): no request of its own.
  const rows = usePostResponses(spaceId, formId).responses;
  const firstPage = open && rows ? { total: rows.length } : undefined;
  const loadedResponses: CalloutFormResponseModel[] = (rows ?? []).map(toFormResponse);

  const responseViews = loadedResponses.map(mapFormResponseToView);
  const columns = deriveFormColumns(questions, responseViews);
  const openResponse = responseViews.find(response => response.id === openResponseId) ?? null;
  const total = firstPage?.total ?? 0;

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
            {!firstPage ? null : (
              <CalloutFormResponsesTable
                columns={columns}
                responses={responseViews}
                total={total}
                hasMore={false}
                loadingMore={false}
                onLoadMore={() => undefined}
                canModerate={canModerate}
                onDelete={id => void onDelete(id)}
                onOpen={setOpenResponseId}
                deletedUserLabel={deletedUserLabel}
              />
            )}
          </div>
          {firstPage && (
            <div className="shrink-0 flex justify-end border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={exporting || total === 0}
                aria-busy={exporting || undefined}
                onClick={() => void exportCsv()}
              >
                <Download className="size-4" aria-hidden="true" />
                {exporting ? t('formResponses.exporting') : t('formResponses.exportCsv')}
              </Button>
            </div>
          )}
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
