import Link from 'next/link';
import { getSession } from '@/features/auth/queries/session';
import { DietMark } from '@/features/dishes/components/diet-mark';
import { getRatedBranches } from '@/features/ratings/queries/member-ratings';
import { defaultCity } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { getMemberLists } from '../queries/member-lists';
import { RemoveSaveButton } from './remove-save-button.client';
import { SavedList } from './saved-list.client';

/** /saved: a member's lists from their account, or the guest's saves on this phone. */
export async function SavedContent() {
  const session = await getSession();
  if (!session) return <SavedList discoverHref={`/${defaultCity}`} />;

  const [lists, rated] = await Promise.all([
    getMemberLists(session.userId),
    getRatedBranches(session.userId),
  ]);
  // "Been there" is every place the member rated, plus anything they added by hand (D42).
  const withRated = lists.map((list) => {
    if (list.kind !== 'been_there') return list;
    const manual = new Set(list.items.map((item) => item.branchId));
    const fromRatings = rated
      .filter((place) => !manual.has(place.branchId))
      .map((place) => ({
        listId: list.id,
        branchId: place.branchId,
        branchSlug: place.branchSlug,
        branchName: place.branchName,
        localityName: place.localityName,
        branchDishId: null,
        dishSlug: null,
        dishName: null,
        diet: null,
        note: null,
      }));
    return { ...list, items: [...fromRatings, ...list.items] };
  });
  return (
    <div className="flex flex-col gap-8">
      {withRated.map((list) => (
        <section key={list.id} aria-labelledby={`list-${list.id}`} className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id={`list-${list.id}`} className="type-title-m">
              {list.kind === 'want_to_try'
                ? t('saves.wantToTry')
                : list.kind === 'been_there'
                  ? t('saves.beenThere')
                  : list.title}
            </h2>
            <p className="text-xs text-inkMuted">{t('saves.itemCount', { count: list.items.length })}</p>
          </div>
          {list.items.length === 0 ? (
            <p className="rounded-panel border-2 border-dashed border-ink/40 bg-paper p-5 text-sm text-inkMuted">
              {list.kind === 'been_there' ? t('saves.beenThereEmpty') : t('saves.wantToTryEmpty')}
            </p>
          ) : (
            <ul className="divide-y-2 divide-dashed divide-ink/15 border-y-2 border-ink">
              {list.items.map((item) => {
                const isDish = item.branchDishId !== null && item.dishSlug !== null && item.dishName !== null;
                const name = isDish ? (item.dishName ?? '') : item.branchName;
                const href = isDish ? `/r/${item.branchSlug}/dish/${item.dishSlug}` : `/r/${item.branchSlug}`;
                return (
                  <li
                    key={`${item.branchId}:${item.branchDishId ?? ''}`}
                    data-diet={item.diet ?? undefined}
                    className="flex items-center justify-between gap-3 px-1 py-3"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <Link
                        href={href}
                        className="truncate text-base hover:underline hover:underline-offset-4"
                      >
                        {name}
                      </Link>
                      <p className="flex items-center gap-2 text-[11px] text-inkMuted">
                        {item.diet ? <DietMark diet={item.diet} /> : null}
                        <span className="truncate">
                          {isDish ? `${item.branchName} · ${item.localityName}` : item.localityName}
                        </span>
                      </p>
                    </div>
                    {list.kind === 'want_to_try' ? (
                      <RemoveSaveButton
                        name={name}
                        target={
                          item.branchDishId
                            ? { kind: 'dish', id: item.branchDishId, branchId: item.branchId }
                            : { kind: 'branch', id: item.branchId, branchId: item.branchId }
                        }
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
