import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface DashboardConfig {
  showRevenue: boolean;
  showTasks: boolean;
  showAIInsights: boolean;
  layout: 'grid' | 'list';
}

interface AppStateContextType {
  user: User | null;
  isAuthReady: boolean;
  logout: () => void;
  activeWindow: string;
  setActiveWindow: (window: string) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  dashboardConfig: DashboardConfig;
  setDashboardConfig: (config: DashboardConfig) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeWindow, setActiveWindow] = useState('Dashboard');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [theme, setTheme] = useState('system');
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    showRevenue: true,
    showTasks: true,
    showAIInsights: true,
    layout: 'grid',
  });
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs: AuditLog[] = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as AuditLog);
      });
      setAuditLogs(logs);
    }, (error) => {
      console.warn('Audit log listener error (may need Firestore index):', error);
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const addAuditLog = async (action: string, details: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'auditLogs'), {
        timestamp: new Date().toISOString(),
        action,
        user: user.displayName || user.email || 'Unknown User',
        details,
      });
    } catch (error) {
      console.warn('Failed to write audit log:', error);
    }
  };

  return (
    <AppStateContext.Provider
      value={{
        user, isAuthReady, logout, activeWindow, setActiveWindow,
        auditLogs, addAuditLog, theme, setTheme, dashboardConfig,
        setDashboardConfig, isSidebarOpen, setSidebarOpen,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
