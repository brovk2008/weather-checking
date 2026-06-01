"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="solid-card rounded-[2rem] p-8" role="alert">
          <div className="flex items-center gap-3">
            <AlertTriangle aria-hidden="true" />
            <h2 className="text-2xl font-semibold">Weather data could not be rendered</h2>
          </div>
          <p className="text-muted mt-3">Refresh the page or try a different city.</p>
        </section>
      );
    }
    return this.props.children;
  }
}
