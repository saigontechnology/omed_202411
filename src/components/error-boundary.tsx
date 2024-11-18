import React, { ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Update state to display fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log the error details
    console.error("Error Boundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI when an error is caught
      return <h1>Something went wrong.</h1>;
    }

    // Render children when there's no error
    return this.props.children;
  }
}

export default ErrorBoundary;
