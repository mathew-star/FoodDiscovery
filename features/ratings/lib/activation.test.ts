import { describe, expect, it } from 'vitest';
import { rankingConfigDefaults } from '../schemas/ranking-config';
import { activatesOnCreate, isCorroborated } from './activation';

const config = rankingConfigDefaults.dish_activation;
const weights = rankingConfigDefaults.rating_weights;

describe('isCorroborated (D47)', () => {
  it('needs two distinct raters', () => {
    expect(isCorroborated([{ userId: 'a', trust: 't2' }], config, weights)).toBe(false);
    expect(
      isCorroborated(
        [
          { userId: 'a', trust: 't2' },
          { userId: 'a', trust: 't2' },
        ],
        config,
        weights,
      ),
    ).toBe(false);
  });

  it('refuses two new accounts but accepts a new account plus a regular', () => {
    expect(
      isCorroborated(
        [
          { userId: 'a', trust: 't0' },
          { userId: 'b', trust: 't0' },
        ],
        config,
        weights,
      ),
    ).toBe(false);
    expect(
      isCorroborated(
        [
          { userId: 'a', trust: 't0' },
          { userId: 'b', trust: 't1' },
        ],
        config,
        weights,
      ),
    ).toBe(true);
    expect(
      isCorroborated(
        [
          { userId: 'a', trust: 't0' },
          { userId: 'b', trust: 't0' },
          { userId: 'c', trust: 't0' },
        ],
        config,
        weights,
      ),
    ).toBe(true);
  });
});

it('activates on create only for a regular member, a listed branch and a canonical match', () => {
  expect(activatesOnCreate({ trust: 't1', branchListed: true, canonicalMatch: true })).toBe(true);
  expect(activatesOnCreate({ trust: 't0', branchListed: true, canonicalMatch: true })).toBe(false);
  expect(activatesOnCreate({ trust: 't1', branchListed: false, canonicalMatch: true })).toBe(false);
  expect(activatesOnCreate({ trust: 't2', branchListed: true, canonicalMatch: false })).toBe(false);
});
