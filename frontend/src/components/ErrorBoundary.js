import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
class ErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            hasError: false,
            error: null,
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    padding: '20px',
                    textAlign: 'center',
                }, children: [_jsx("h1", { style: { color: '#ef4444', marginBottom: '16px' }, children: "Something went wrong" }), _jsx("p", { style: { color: '#6b7280', marginBottom: '24px' }, children: this.state.error?.message || 'An unexpected error occurred' }), _jsx("button", { onClick: () => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }, style: {
                            padding: '10px 20px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }, children: "Reload Page" })] }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
