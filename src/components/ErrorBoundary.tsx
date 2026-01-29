import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { captureException, setContext, Sentry } from '@/lib/sentry';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
    showFeedback?: boolean;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
    eventId?: string;
    showFeedbackDialog: boolean;
}

/**
 * Error Boundary Component with Sentry Integration
 * Catches React errors, reports to Sentry, and displays user-friendly fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, showFeedbackDialog: false };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error locally
        logger.error('ErrorBoundary caught an error', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        });

        // Set context for Sentry
        setContext('react', {
            componentStack: errorInfo.componentStack,
        });

        // Capture exception in Sentry and get event ID
        captureException(error, {
            componentStack: errorInfo.componentStack,
        });

        // Store event ID for feedback dialog
        const eventId = Sentry.lastEventId?.() || undefined;

        this.setState({ errorInfo, eventId });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
            eventId: undefined,
            showFeedbackDialog: false
        });
        this.props.onReset?.();
    };

    handleFeedback = () => {
        // Show Sentry user feedback dialog if available
        if (this.state.eventId && Sentry.showReportDialog) {
            Sentry.showReportDialog({ eventId: this.state.eventId });
        } else {
            this.setState({ showFeedbackDialog: true });
        }
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI with Sentry integration
            return (
                <div className="flex items-center justify-center min-h-screen p-4 bg-background">
                    <Card className="max-w-md w-full p-8 space-y-6 text-center">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-destructive" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-foreground">
                                Nimadir xato ketdi
                            </h1>
                            <p className="text-muted-foreground">
                                Afsuski, kutilmagan xatolik yuz berdi. Sahifani yangilashga harakat qiling.
                            </p>
                            {this.state.eventId && (
                                <p className="text-xs text-muted-foreground/60">
                                    Xato ID: {this.state.eventId}
                                </p>
                            )}
                        </div>

                        {this.state.error && (
                            <details className="text-left">
                                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                                    Texnik tafsilotlar
                                </summary>
                                <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-32">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Button onClick={this.handleReset} variant="outline">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Qayta urinish
                            </Button>
                            <Button onClick={() => window.location.reload()}>
                                Sahifani yangilash
                            </Button>
                            {this.props.showFeedback !== false && this.state.eventId && (
                                <Button onClick={this.handleFeedback} variant="ghost">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Xabar yuborish
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}
