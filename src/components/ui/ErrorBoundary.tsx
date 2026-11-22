/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown } from 'lucide-react';
import { translations } from '../../data/translations';
import type { Language } from '../../types';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  sectionName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
  errorStack: string;
  componentStack: string;
}

function getActiveLanguage(): Language {
  try {
    return localStorage.getItem('baust_lang') === 'bn' ? 'bn' : 'en';
  } catch {
    return 'en';
  }
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      errorStack: '',
      componentStack: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected error occurred.',
      errorStack: error?.stack || '',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `Application ErrorBoundary${this.props.sectionName ? ` (${this.props.sectionName})` : ''} caught error:`,
      error,
      errorInfo
    );
    this.setState({
      componentStack: errorInfo?.componentStack || '',
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      errorMessage: '',
      errorStack: '',
      componentStack: '',
    });
  };

  handleGoHome = () => {
    this.setState({
      hasError: false,
      errorMessage: '',
      errorStack: '',
      componentStack: '',
    });
    window.location.hash = '#/';
  };

  render() {
    if (this.state.hasError) {
      const lang = getActiveLanguage();
      const copy = translations[lang].errorBoundary;
      return (
        <div
          className={`min-h-[60vh] bg-[#F5F7FA] flex items-center justify-center p-4 sm:p-6 ${
            lang === 'bn' ? 'font-bengali leading-relaxed' : ''
          }`}
        >
          <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-rose-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-[#0F2A4A]">{copy.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {this.props.sectionName
                  ? lang === 'bn'
                    ? `${this.props.sectionName} লোড করার সময় একটি সমস্যা দেখা দিয়েছে। আপনার তথ্য সুরক্ষিত রয়েছে।`
                    : `We encountered a display issue while loading ${this.props.sectionName}. Your data remains safe.`
                  : copy.subtitle}
              </p>
            </div>

            <details className="text-left bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs">
              <summary className="font-bold text-slate-700 cursor-pointer flex items-center justify-between select-none">
                <span>{copy.details}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </summary>
              <div className="mt-2.5 pt-2.5 border-t border-slate-200 space-y-2">
                <p className="font-mono text-[11px] text-rose-700 break-words">
                  {this.state.errorMessage || 'Unknown runtime error'}
                </p>
                {this.state.errorStack && (
                  <pre className="text-[10px] text-slate-500 bg-white border border-slate-200 rounded-xl p-2 overflow-x-auto max-h-36 whitespace-pre-wrap">
                    {this.state.errorStack}
                  </pre>
                )}
              </div>
            </details>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F2A4A] hover:bg-[#1A3E68] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {copy.tryAgain}
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                <Home className="w-4 h-4" />
                {copy.goHome}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
