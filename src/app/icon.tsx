import { ImageResponse } from 'next/og';

// Metadatos de la imagen
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Generador de favicon dinámico para DeliverabilityGuard
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b0f19 0%, #0f172a 100%)',
          borderRadius: '7px',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Escudo de seguridad en verde esmeralda (#10b981) */}
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            fill="rgba(16, 185, 129, 0.2)"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Checkmark interior (#34d399) */}
          <path
            d="m9 12 2 2 4-4"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
