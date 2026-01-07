import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Types
export interface PageViewEvent {
  pageUrl: string;
  referrer?: string;
  sessionId: string;
  duration?: number;
}

export interface UserActionEvent {
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

export interface ConversionEvent {
  conversionType: string;
  value?: number;
  funnel?: string;
  step?: number;
  metadata?: Record<string, any>;
}

// Analytics Client
class AnalyticsClient {
  private apiUrl: string;
  private sessionId: string;
  private pageStartTime: number = 0;
  private isEnabled: boolean = true;

  constructor(apiUrl = '/api') {
    this.apiUrl = apiUrl;
    this.sessionId = this.generateSessionId();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Track page view
   */
  async trackPageView(pageUrl: string, referrer?: string) {
    if (!this.isEnabled) return;

    this.pageStartTime = Date.now();

    try {
      await fetch(`${this.apiUrl}/analytics/page-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageUrl,
          referrer: referrer || document.referrer,
          sessionId: this.sessionId,
        }),
      });
    } catch (error) {
      console.error('Analytics: Failed to track page view', error);
    }
  }

  /**
   * Track user action
   */
  async trackAction(
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>,
  ) {
    if (!this.isEnabled) return;

    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${this.apiUrl}/analytics/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          action,
          resource,
          resourceId,
          metadata,
        }),
      });
    } catch (error) {
      console.error('Analytics: Failed to track action', error);
    }
  }

  /**
   * Track conversion
   */
  async trackConversion(
    conversionType: string,
    value?: number,
    funnel?: string,
    step?: number,
    metadata?: Record<string, any>,
  ) {
    if (!this.isEnabled) return;

    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${this.apiUrl}/analytics/conversion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          conversionType,
          value,
          funnel,
          step,
          metadata,
        }),
      });
    } catch (error) {
      console.error('Analytics: Failed to track conversion', error);
    }
  }

  /**
   * Track page exit (with duration)
   */
  async trackPageExit() {
    if (!this.isEnabled || this.pageStartTime === 0) return;

    const duration = Date.now() - this.pageStartTime;

    try {
      await fetch(`${this.apiUrl}/analytics/page-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageUrl: window.location.pathname,
          sessionId: this.sessionId,
          duration,
        }),
      });
    } catch (error) {
      console.error('Analytics: Failed to track page exit', error);
    }
  }

  /**
   * Track batch events
   */
  async trackBatch(
    events: Array<{ type: string; [key: string]: any }>,
  ) {
    if (!this.isEnabled) return;

    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${this.apiUrl}/analytics/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('Analytics: Failed to track batch', error);
    }
  }
}

// Global instance
const analytics = new AnalyticsClient();

// React Hook for page tracking
export function useAnalyticsPageTracking() {
  const pathname = usePathname();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // Avoid double tracking in development strict mode
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    // Track page view on route change
    analytics.trackPageView(pathname);

    // Return cleanup function to track exit
    return () => {
      analytics.trackPageExit();
    };
  }, [pathname]);
}

// React Hook for action tracking
export function useAnalyticsAction() {
  return (
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>,
  ) => {
    analytics.trackAction(action, resource, resourceId, metadata);
  };
}

// React Hook for conversion tracking
export function useAnalyticsConversion() {
  return (
    conversionType: string,
    value?: number,
    funnel?: string,
    step?: number,
    metadata?: Record<string, any>,
  ) => {
    analytics.trackConversion(
      conversionType,
      value,
      funnel,
      step,
      metadata,
    );
  };
}

// Export instance
export default analytics;
