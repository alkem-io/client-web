import { compact } from 'lodash-es';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { usePlatformDiscussionsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { ForumDiscussionList } from '@/crd/components/forum/ForumDiscussionList';
import { ForumDiscussionListHeader } from '@/crd/components/forum/ForumDiscussionListHeader';
import { ForumEmptyState } from '@/crd/components/forum/ForumEmptyState';
import { ForumInitiateDiscussionDialog } from '@/crd/components/forum/ForumInitiateDiscussionDialog';
import type { ForumSortOrder } from '@/crd/components/forum/forumTypes';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { Button } from '@/crd/primitives/button';
import { useAuthorsDetails } from '@/domain/community/user/hooks/useAuthorsDetails';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import {
  ForumDiscussionFormConnector,
  type ForumDiscussionFormState,
} from '@/main/crdPages/topLevelPages/forum/ForumDiscussionFormConnector';
import { buildMetaLine, mapDiscussionsToListData } from '@/main/crdPages/topLevelPages/forum/forumDataMapper';
import { ALL_SLUG, categoryFor } from '@/main/crdPages/topLevelPages/forum/useCategorySlug';
import { useForumSubscription } from '@/main/crdPages/topLevelPages/forum/useForumSubscription';

const CrdForumPage = () => {
  const { t } = useTranslation('crd-forum');
  const { t: tDefault, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  usePageTitle(tDefault('pages.titles.forum'));

  const params = useParams<{ categorySlug?: string }>();
  const slugFromUrl = params.categorySlug ?? ALL_SLUG;
  const activeCategory = categoryFor(slugFromUrl);

  const { data, loading: loadingDiscussions, subscribeToMore } = usePlatformDiscussionsQuery();
  // @ts-expect-error react-18 / subscribeToMore generic mismatch (matches legacy MUI pattern)
  useForumSubscription(data, query => query?.platform.forum, subscribeToMore);

  const { loading: loadingUser, platformPrivilegeWrapper } = useCurrentUserContext();
  const canCreateDiscussion =
    data?.platform.forum.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateDiscussion) ?? false;

  const isPlatformAdmin = platformPrivilegeWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin) ?? false;

  // Non-admins can't create "Releases" discussions — that's reserved for the
  // Alkemio team's release-notes posts. Matches the legacy MUI ForumPage logic.
  const validCategories = data?.platform.forum.discussionCategories ?? [];
  const discussionCreationCategories = isPlatformAdmin
    ? validCategories
    : validCategories.filter(category => category !== ForumDiscussionCategory.Releases);

  const forumId = data?.platform.forum.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<ForumSortOrder>('newest');

  // Initiate-discussion dialog state. The dialog opens via the Initiate button
  // OR via the `?dialog=new` query param — but only when the viewer has
  // CreateDiscussion. Unprivileged viewers landing on `?dialog=new` see the
  // landing page unchanged.
  const [isInitiateOpen, setIsInitiateOpen] = useState(false);
  const [formState, setFormState] = useState<ForumDiscussionFormState>({
    submitForm: () => {},
    submitDisabled: true,
    busy: false,
  });

  const dialogParam = searchParams.get('dialog');
  useEffect(() => {
    if (dialogParam === 'new' && canCreateDiscussion) {
      setIsInitiateOpen(true);
    }
  }, [dialogParam, canCreateDiscussion]);

  const handleCloseInitiate = (next: boolean) => {
    setIsInitiateOpen(next);
    if (!next && searchParams.has('dialog')) {
      navigate('/forum');
    }
  };

  const allAuthorIds = compact(data?.platform.forum.discussions?.map(d => d.createdBy));
  const { getAuthor } = useAuthorsDetails(allAuthorIds);

  const locale = resolveDateFnsLocale(i18n.language);

  const allItems = mapDiscussionsToListData(data, { t, tDefault, locale, getAuthor });

  const filteredItems = allItems.filter(item => {
    const discussion = data?.platform.forum.discussions?.find(d => d.id === item.id);
    if (!discussion) return false;
    const matchesCategory = !activeCategory || discussion.category === activeCategory;
    if (!matchesCategory) return false;
    if (!searchQuery) return true;
    const needle = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(needle) || item.author.displayName.toLowerCase().includes(needle);
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOrder === 'oldest') return a.id.localeCompare(b.id);
    return b.id.localeCompare(a.id);
  });

  const loading = loadingDiscussions || loadingUser;

  return (
    <div className="flex flex-col gap-4">
      <ForumDiscussionListHeader
        countLabel={t('list.headerCount', { count: sortedItems.length })}
        initiateSlot={
          canCreateDiscussion ? (
            <Button size="sm" onClick={() => setIsInitiateOpen(true)} className="gap-1.5">
              <Plus aria-hidden="true" className="size-4" />
              {t('list.initiate')}
            </Button>
          ) : null
        }
        searchValue={searchQuery}
        searchPlaceholder={t('list.searchPlaceholder')}
        searchAriaLabel={t('list.searchAriaLabel')}
        onSearchChange={setSearchQuery}
        sortValue={sortOrder}
        sortAriaLabel={t('list.sort.ariaLabel')}
        sortOptions={[
          { value: 'newest', label: t('list.sort.newest') },
          { value: 'oldest', label: t('list.sort.oldest') },
        ]}
        onSortChange={setSortOrder}
      />
      <ForumDiscussionList
        items={sortedItems}
        metaLineFor={item => buildMetaLine(item, t)}
        loading={loading}
        loadingLabel={t('list.loading')}
        emptySlot={<ForumEmptyState title={t('list.empty.title')} subtitle={t('list.empty.subtitle')} />}
        onActivate={id => {
          const item = sortedItems.find(entry => entry.id === id);
          if (item?.href) navigate(item.href);
        }}
      />

      {canCreateDiscussion && forumId ? (
        <ForumInitiateDiscussionDialog
          open={isInitiateOpen}
          onOpenChange={handleCloseInitiate}
          mode="initiate"
          title={t('dialog.create.title')}
          submitLabel={t('dialog.create.submit')}
          cancelLabel={t('dialog.cancel')}
          closeLabel={t('dialog.close')}
          submitDisabled={formState.submitDisabled}
          busy={formState.busy}
          onSubmit={formState.submitForm}
        >
          <ForumDiscussionFormConnector
            mode="initiate"
            forumId={forumId}
            availableCategories={discussionCreationCategories}
            onStateChange={setFormState}
            onCompleted={() => setIsInitiateOpen(false)}
          />
        </ForumInitiateDiscussionDialog>
      ) : null}
    </div>
  );
};

export default CrdForumPage;
