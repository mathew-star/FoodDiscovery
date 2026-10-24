import { ImageResponse } from 'next/og';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

/* Image generation cannot read CSS variables; these mirror the tokens in app/globals.css (checked by tokens.test.ts). */
export const ogPalette = {
  cream: '#ecebc9',
  paper: '#f8f7e8',
  ink: '#141612',
  inkMuted: '#4a4d43',
  lime: '#c7ea76',
  olive: '#76a02b',
};

type OgCardProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  badge?: string;
  brand: string;
  city: string;
};

export function renderOgCard({ eyebrow, title, subtitle, badge, brand, city }: OgCardProps): ImageResponse {
  const { cream, paper, ink, inkMuted, lime, olive } = ogPalette;
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: cream, padding: 48 }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: paper,
          border: `4px solid ${ink}`,
          borderRadius: 40,
          boxShadow: `14px 14px 0 ${ink}`,
          padding: 56,
          color: ink,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              background: ink,
              color: cream,
              border: `4px solid ${ink}`,
              boxShadow: `4px 4px 0 ${lime}`,
              padding: '6px 20px',
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            {brand}
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: inkMuted }}>{eyebrow}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 0.95, letterSpacing: -2 }}>{title}</div>
          {subtitle ? <div style={{ fontSize: 34, color: inkMuted }}>{subtitle}</div> : null}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `3px dashed ${inkMuted}`,
            paddingTop: 24,
          }}
        >
          {badge ? (
            <div
              style={{
                display: 'flex',
                background: lime,
                border: `3px solid ${ink}`,
                borderRadius: 14,
                boxShadow: `4px 4px 0 ${ink}`,
                padding: '8px 20px',
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              {badge}
            </div>
          ) : (
            <div style={{ display: 'flex' }} />
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              border: `3px solid ${ink}`,
              borderRadius: 999,
              background: paper,
              padding: '8px 22px',
              fontSize: 26,
            }}
          >
            <div style={{ display: 'flex', width: 14, height: 14, borderRadius: 999, background: olive }} />
            {city}
          </div>
        </div>
      </div>
    </div>,
    ogSize,
  );
}
