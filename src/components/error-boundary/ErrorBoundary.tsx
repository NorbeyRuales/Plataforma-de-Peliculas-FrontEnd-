import React from 'react';

type Props = {
    children: React.ReactNode;
    /** Contenido opcional para mostrar en lugar del fallback por defecto */
    fallback?: React.ReactNode;
    /** Llamado al pulsar “Reintentar”; si no lo pasas, recarga la página */
    onReset?: () => void;
    /** Si cambian, el boundary se resetea automáticamente (p.ej., pathname) */
    resetKeys?: any[];
};

type State = { hasError: boolean; error?: unknown };

export default class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: unknown): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: unknown, info: unknown) {
        // Log no intrusivo (puedes enviar a un logger externo si quieres)
        console.error('[UI ErrorBoundary]', error, info);
    }

    componentDidUpdate(prevProps: Props) {
        const { resetKeys = [] } = this.props;
        const prev = prevProps.resetKeys || [];
        const changed = resetKeys.length !== prev.length ||
            resetKeys.some((k, i) => k !== prev[i]);
        if (this.state.hasError && changed) {
            this.setState({ hasError: false, error: undefined });
        }
    }

    private handleRetry = () => {
        if (this.props.onReset) this.props.onReset();
        else window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return <>{this.props.fallback}</>;
            return (
                <section className="container" role="alert" aria-live="assertive" style={{ margin: '2rem auto' }}>
                    <h1 style={{ marginBottom: '.5rem' }}>Algo salió mal</h1>
                    <p className="muted" style={{ marginBottom: '.75rem' }}>
                        Hubo un problema al mostrar esta sección. Puedes intentarlo de nuevo.
                    </p>
                    <div className="row">
                        <button type="button" className="btn success" onClick={this.handleRetry}>Reintentar</button>
                        <a href="/" className="btn ghost">Ir al inicio</a>
                    </div>
                </section>
            );
        }
        return this.props.children as React.ReactElement;
    }
}
