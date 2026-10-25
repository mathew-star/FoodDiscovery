import { t } from '@/i18n';
import { ogPalette } from '@/shared/ui/og-card';

const escape = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

type ActionEmail = { heading: string; body: string; button: string; url: string; footnote: string };

/** One-button email in the FDN look: cream page, paper card, ink border, lime button. Inline styles only. */
export function renderActionEmail({ heading, body, button, url, footnote }: ActionEmail) {
  const { cream, paper, ink, inkMuted, lime } = ogPalette;
  const href = escape(url);
  const html = `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:${cream};font-family:Arial,Helvetica,sans-serif;color:${ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:${paper};border:2px solid ${ink};box-shadow:4px 4px 0 ${ink}">
<tr><td style="padding:28px">
<p style="margin:0 0 20px;font-weight:bold;font-size:20px">${escape(t('app.name'))}</p>
<h1 style="margin:0 0 12px;font-size:24px;line-height:1.2">${escape(heading)}</h1>
<p style="margin:0 0 24px;font-size:16px;line-height:1.5">${escape(body)}</p>
<a href="${href}" style="display:inline-block;padding:12px 20px;background:${lime};color:${ink};border:2px solid ${ink};text-decoration:none;font-weight:bold">${escape(button)}</a>
<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:${inkMuted}">${escape(footnote)}</p>
<p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:${inkMuted};word-break:break-all">${href}</p>
</td></tr></table></body></html>`;
  const text = `${heading}\n\n${body}\n\n${button}: ${url}\n\n${footnote}\n`;
  return { html, text };
}

export function verificationEmail(url: string) {
  return {
    subject: t('auth.email.verify.subject'),
    tag: 'verify-email',
    ...renderActionEmail({
      heading: t('auth.email.verify.heading'),
      body: t('auth.email.verify.body'),
      button: t('auth.email.verify.button'),
      url,
      footnote: t('auth.email.verify.footnote'),
    }),
  };
}

export function resetPasswordEmail(url: string) {
  return {
    subject: t('auth.email.reset.subject'),
    tag: 'reset-password',
    ...renderActionEmail({
      heading: t('auth.email.reset.heading'),
      body: t('auth.email.reset.body'),
      button: t('auth.email.reset.button'),
      url,
      footnote: t('auth.email.reset.footnote'),
    }),
  };
}
