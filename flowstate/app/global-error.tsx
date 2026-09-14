'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: '#060609',
          color: '#f5f5f7',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '26rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            FLOWSTATE could not start
          </h1>
          <p style={{ color: '#9c9caa', lineHeight: 1.6, marginTop: '1rem' }}>
            A fault stopped the app loading. Reloading usually clears it.
            {error.digest ? ` Reference: ${error.digest}` : ''}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              height: '3rem',
              padding: '0 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: '#ff6a2b',
              color: '#180700',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
