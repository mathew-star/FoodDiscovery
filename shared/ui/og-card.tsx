import { ImageResponse } from 'next/og';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

/* Image generation cannot read CSS variables; these mirror the day-counter tokens in app/globals.css. */
const palette = {
  paper: '#f4eee1',
  raised: '#fffcf5',
  ink: '#1a1c2e',
  inkSoft: '#55516a',
  haldi: '#f2b300',
  loved: '#b0102c',
};

function StampBox({
  color,
  rotate,
  fontSize,
  children,
}: {
  color: string;
  rotate: number;
  fontSize: number;
  children: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        border: `4px solid ${color}`,
        borderRadius: 8,
        padding: 4,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          border: `2px solid ${color}`,
          borderRadius: 4,
          padding: '4px 16px',
          color,
          fontSize,
          fontWeight: 800,
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}
      >
        {children}
      </div>
    </div>
  );
}

type OgCardProps = { eyebrow: string; title: string; subtitle?: string; badge?: string; brand: string };

export function renderOgCard({ eyebrow, title, subtitle, badge, brand }: OgCardProps): ImageResponse {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: palette.paper, padding: 48 }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: palette.raised,
          border: `4px solid ${palette.ink}`,
          boxShadow: `12px 12px 0 ${palette.ink}`,
          padding: 56,
          color: palette.ink,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <StampBox color={palette.ink} rotate={-6} fontSize={40}>
            {brand}
          </StampBox>
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: palette.inkSoft,
            }}
          >
            {eyebrow}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 0.95, letterSpacing: -2 }}>{title}</div>
          {subtitle ? <div style={{ fontSize: 34, color: palette.inkSoft }}>{subtitle}</div> : null}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `4px dashed ${palette.inkSoft}`,
            paddingTop: 24,
          }}
        >
          {badge ? (
            <StampBox color={palette.loved} rotate={-3} fontSize={36}>
              {badge}
            </StampBox>
          ) : (
            <div style={{ display: 'flex' }} />
          )}
          <div
            style={{
              display: 'flex',
              background: palette.haldi,
              border: `4px solid ${palette.ink}`,
              padding: '8px 18px',
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            Hyderabad
          </div>
        </div>
      </div>
    </div>,
    ogSize,
  );
}
