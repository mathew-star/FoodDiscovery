import type { TrustRulesConfig } from '@/features/ratings/schemas/ranking-config';

export type TrustLevel = 't0' | 't1' | 't2' | 'founding';

export type TrustFacts = {
  current: TrustLevel;
  accountDays: number;
  /** Ratings and dishes that count (approved), the spec's "approved contributions". */
  contributions: number;
  upheldReports: number;
  factConfirmations: number;
  factAgreements: number;
};

/**
 * Spec §2.2. T1: account ≥ 3 days, ≥ 3 approved contributions, no upheld report in 30 days.
 * T2: ≥ 30 days, ≥ 25 contributions, ≥ 80% of fact confirmations agree with consensus (with enough
 * confirmations to judge, D53). An upheld report drops one level for its window. Founding is kept.
 */
export function evaluateTrust(facts: TrustFacts, rules: TrustRulesConfig): TrustLevel {
  if (facts.current === 'founding') return 'founding';
  const agreement = facts.factConfirmations > 0 ? facts.factAgreements / facts.factConfirmations : 0;
  const earned: TrustLevel =
    facts.accountDays >= rules.t2.minAccountDays &&
    facts.contributions >= rules.t2.minContributions &&
    facts.factConfirmations >= rules.t2.minFactConfirmations &&
    agreement >= rules.t2.minFactAgreement
      ? 't2'
      : facts.accountDays >= rules.t1.minAccountDays && facts.contributions >= rules.t1.minContributions
        ? 't1'
        : 't0';
  if (facts.upheldReports === 0) return earned;
  return earned === 't2' ? 't1' : 't0';
}
