const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = new URL(productionHost ? `https://${productionHost}` : 'http://localhost:3000');

/** Sign-in page (P3). Intent prompts link here with `?next=` so the original action can resume (spec W2). */
export const signInPath = '/login';
