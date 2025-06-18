import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error details
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Something went wrong
                                </h3>
                            </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            An error occurred while loading this page. Please try refreshing the page or contact support if the problem persists.
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-4">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Error Details (Development)
                                </summary>
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-40">
                                    <div className="mb-2">
                                        <strong>Error:</strong> {this.state.error.toString()}
                                    </div>
                                    {this.state.errorInfo && (
                                        <div>
                                            <strong>Component Stack:</strong>
                                            <pre>{this.state.errorInfo.componentStack}</pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}

                        <div className="flex space-x-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
