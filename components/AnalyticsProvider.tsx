'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import analytics, { useAnalyticsPageTracking } from '@/lib/analytics';

interface AnalyticsContextType {
  trackAction: (
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>,
  ) => void;
  trackConversion: (
    conversionType: string,
    value?: number,
    funnel?: string,
    step?: number,
    metadata?: Record<string, any>,
  ) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Track page views on route change
  useEffect(() => {
    analytics.trackPageView(pathname);
  }, [pathname]);

  const trackAction = (
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>,
  ) => {
    analytics.trackAction(action, resource, resourceId, metadata);
  };

  const trackConversion = (
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

  return (
    <AnalyticsContext.Provider value={{ trackAction, trackConversion }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}
