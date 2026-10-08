/**
 * DataContext.jsx
 * ───────────────
 * Centralized context that fetches and stores live data from the three new
 * backend endpoints: /api/dashboard, /api/analytics, /api/reports.
 *
 * Any page that needs this data consumes useData() instead of making
 * individual API calls — avoiding duplicated state and keeping everything
 * synchronized after every AI conversation.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { chatService } from '../../services/chatService';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [reportsData,   setReportsData]   = useState(null);
  const [isLoading,     setIsLoading]     = useState(false);
  const [lastRefresh,   setLastRefresh]   = useState(null);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dash, analytics, reports] = await Promise.all([
        chatService.getDashboardData(),
        chatService.getAnalyticsData(),
        chatService.getReportsData(),
      ]);
      if (dash)      setDashboardData(dash);
      if (analytics) setAnalyticsData(analytics);
      if (reports)   setReportsData(reports);
      setLastRefresh(new Date());
    } catch (err) {
      console.warn('[DataContext] Failed to refresh data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => { refreshAll(); }, [refreshAll]);

  const value = {
    dashboardData,
    analyticsData,
    reportsData,
    isLoading,
    lastRefresh,
    refreshAll,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
};
