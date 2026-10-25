import { useSyncExternalStore } from 'react';

/*
  Client mirror of a signed-in member's "Want to try" keys. `MemberSync` marks the member and fills
  the keys; Save buttons read it. Guests never touch this store.
*/
type MemberSaves = { signedIn: boolean; keys: ReadonlySet<string> | null };

const listeners = new Set<() => void>();
const guest: MemberSaves = { signedIn: false, keys: null };
let state: MemberSaves = guest;

function emit(next: MemberSaves) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMemberSaves(): MemberSaves {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => guest,
  );
}

export function markSignedIn(keys: readonly string[] | null) {
  emit({ signedIn: true, keys: keys ? new Set(keys) : state.keys });
}

export function markSignedOut() {
  emit(guest);
}

export function setMemberKey(key: string, on: boolean) {
  const keys = new Set(state.keys ?? []);
  if (on) keys.add(key);
  else keys.delete(key);
  emit({ ...state, keys });
}
