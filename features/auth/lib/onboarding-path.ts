/** Every fresh session passes through onboarding, which forwards at once when the profile is done. */
export const onboardingPath = (next: string) => `/onboarding?${new URLSearchParams({ next })}`;
