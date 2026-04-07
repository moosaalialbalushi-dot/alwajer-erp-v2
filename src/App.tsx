import React from 'react';
import { AppStateProvider, useAppState } from './store/AppState';
import { LockScreen } from './components/LockScreen';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { AICommand } from './views/AICommand';
import { AuditHistory } from './views/AuditHistory';
import { CostSaleCalculator } from './views/CostSaleCalculator';
import { IndustrialStudio } from './views/IndustrialStudio';
import { Formulations } from './views/Formulations';
import { 
  Manufacturing, Inventory, Sales, Procurement, 
  Accounting, HRAdmin, RDLab, Vendors, Tasks,
  BusinessDev, Samples 
} from './views/GenericViews';

function AppContent() {
  const { user, isAuthReady, activeWindow } = useAppState();

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">Loading...</div>;
  }
  if (!user) {
    return <LockScreen />;
  }

  const renderWindow = () => {
    switch (activeWindow) {
      case 'Dashboard': return <Dashboard />;
      case 'Manufacturing': return <Manufacturing />;
      case 'Inventory': return <Inventory />;
      case 'Sales': return <Sales />;
      case 'Procurement': return <Procurement />;
      case 'Vendors': return <Vendors />;
      case 'Tasks': return <Tasks />;
      case 'Accounting': return <Accounting />;
      case 'HRAdmin': return <HRAdmin />;
      case 'RDLab': return <RDLab />;
      case 'Formulations': return <Formulations />;
      case 'IndustrialStudio': return <IndustrialStudio />;
      case 'BusinessDev': return <BusinessDev />;
      case 'Samples': return <Samples />;
      case 'Calculator': return <CostSaleCalculator />;
      case 'AICommand': return <AICommand />;
      case 'AuditHistory': return <AuditHistory />;
      default: return <Dashboard />;
    }
  };

  return <Layout>{renderWindow()}</Layout>;
}

export default function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}
