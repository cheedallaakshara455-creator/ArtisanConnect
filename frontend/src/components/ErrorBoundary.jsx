import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Page rendering failed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" role="alert" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h1>We couldn’t load this page</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Something went wrong while displaying this page. Please try again.
          </p>
          <button className="btn btn-primary" onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
