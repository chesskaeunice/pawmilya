import { Component } from "react";

import "./ErrorBoundary.css";

// Catches an error thrown while rendering what is inside it, so a pop-up shows a message
// and a Close button instead of silently disappearing (or taking the whole page down).
// A pop-up's content is mounted only while it is open, so every opening starts fresh.
class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // still visible to developers in the browser console
    console.error("A pop-up failed to render:", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="error-boundary" role="alert">
        <p>Something went wrong. Please try again.</p>

        <button type="button" className="mform__primary" onClick={this.props.onClose}>
          Close
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
