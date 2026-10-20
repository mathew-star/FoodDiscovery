import { ImageResponse } from 'next/og';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

const palette = {
  bg: '#fbf7f1',
  text: '#2a1d12',
  muted: '#6a5644',
  primary: '#b4410f',
  onPrimary: '#ffffff',
  soft: '#f4ece1',
};

type OgCardProps = { eyebrow: string; title: string; subtitle?: string; badge?: string; brand: string };

export function renderOgCard({ eyebrow, title, subtitle, badge, brand }: OgCardProps): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: palette.bg,
        padding: 72,
        color: palette.text,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: palette.primary,
            color: palette.onPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          {brand.slice(0, 1)}
        </div>
        <div style={{ fontSize: 34, fontWeight: 700 }}>{brand}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div
          style={{
            fontSize: 30,
            color: palette.primary,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          {eyebrow}
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
        {subtitle ? <div style={{ fontSize: 36, color: palette.muted }}>{subtitle}</div> : null}
      </div>
      {badge ? (
        <div style={{ display: 'flex' }}>
          <div
            style={{
              background: palette.soft,
              borderRadius: 999,
              padding: '14px 28px',
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            {badge}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex' }} />
      )}
    </div>,
    ogSize,
  );
}
