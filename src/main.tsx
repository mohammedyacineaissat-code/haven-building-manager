import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// Remove the startup fallback loading indicator once React mounts
const removeFallback = () => {
  const fallback = document.getElementById('startup-fallback');
  if (fallback) fallback.style.display = 'none';
};

try {
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    throw new Error('Root element #root not found in DOM');
  }

  const root = createRoot(rootEl);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );

  // Hide the loading fallback after a short delay to ensure React has mounted
  setTimeout(removeFallback, 100);
} catch (err) {
  console.error('[Haven] Failed to initialize React app:', err);
  const fallback = document.getElementById('startup-fallback');
  if (fallback) {
    fallback.innerHTML = `
      <div style="padding:24px;text-align:center;font-family:Inter,system-ui,sans-serif;">
        <p style="font-size:48px;">❌</p>
        <h2 style="font-size:18px;font-weight:700;">Échec du démarrage</h2>
        <p style="color:#64748B;font-size:13px;margin:8px 0 16px;">
          ${err instanceof Error ? err.message : 'Erreur inconnue'}
        </p>
        <button onclick="location.reload()" style="background:#10B981;color:#FFF;border:none;border-radius:12px;padding:10px 20px;font-size:14px;font-weight:600;cursor:pointer;">
          Réessayer
        </button>
      </div>
    `;
    fallback.style.display = 'flex';
  }
}
