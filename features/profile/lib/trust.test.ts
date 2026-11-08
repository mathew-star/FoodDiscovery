import { describe, expect, it } from 'vitest';
import { rankingConfigDefaults } from '@/features/ratings/schemas/ranking-config';
import { evaluateTrust, type TrustFacts } from './trust';

const rules = rankingConfigDefaults.trust_rules;
const base: TrustFacts = {
  current: 't0',
  accountDays: 0,
  contributions: 0,
  upheldReports: 0,
  factConfirmations: 0,
  factAgreements: 0,
};

describe('evaluateTrust (spec §2.2)', () => {
  it('starts new members at T0', () => {
    expect(evaluateTrust(base, rules)).toBe('t0');
    expect(evaluateTrust({ ...base, accountDays: 10, contributions: 2 }, rules)).toBe('t0');
    expect(evaluateTrust({ ...base, accountDays: 2, contributions: 50 }, rules)).toBe('t0');
  });

  it('reaches T1 at 3 days and 3 contributions', () => {
    expect(evaluateTrust({ ...base, accountDays: 3, contributions: 3 }, rules)).toBe('t1');
  });

  it('needs enough agreeing fact confirmations for T2', () => {
    const veteran = { ...base, accountDays: 40, contributions: 30 };
    expect(evaluateTrust(veteran, rules)).toBe('t1');
    expect(evaluateTrust({ ...veteran, factConfirmations: 10, factAgreements: 8 }, rules)).toBe('t2');
    expect(evaluateTrust({ ...veteran, factConfirmations: 10, factAgreements: 7 }, rules)).toBe('t1');
  });

  it('drops one level after an upheld report and never touches founding', () => {
    expect(evaluateTrust({ ...base, accountDays: 3, contributions: 3, upheldReports: 1 }, rules)).toBe('t0');
    expect(
      evaluateTrust(
        {
          ...base,
          accountDays: 40,
          contributions: 30,
          factConfirmations: 10,
          factAgreements: 10,
          upheldReports: 1,
        },
        rules,
      ),
    ).toBe('t1');
    expect(evaluateTrust({ ...base, current: 'founding' }, rules)).toBe('founding');
  });
});
