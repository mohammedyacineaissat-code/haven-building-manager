import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary — catches rendering errors in the component tree
 * and displays a visible error screen instead of a white blank page.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[Haven ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'Inter, system-ui, sans-serif',
          background: '#F8FAFC',
          color: '#0F172A',
        }}>
          <div style={{
            maxWidth: '420px',
            width: '100%',
            background: '#FFF',
            borderRadius: '16px',
            padding: '32px 24px',
            boxShadow: '0 4px 24px rgba(15,23,42,0.08)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              Haven — Erreur
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px', lineHeight: 1.5 }}>
              L'application a rencontré une erreur inattendue. 
              Veuillez redémarrer l'application.
            </p>
            <details style={{
              textAlign: 'left',
              background: '#F1F5F9',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              fontSize: '12px',
              color: '#475569',
              maxHeight: '200px',
              overflow: 'auto',
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Détails techniques</summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: '8px' }}>
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              style={{
                background: '#10B981',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Redémarrer l'application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
