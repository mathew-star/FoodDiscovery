const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = new URL(productionHost ? `https://${productionHost}` : 'http://localhost:3000');

export const themeCookie = 'theme';
export const themes = ['light', 'dark'] as const;
export type Theme = (typeof themes)[number];
