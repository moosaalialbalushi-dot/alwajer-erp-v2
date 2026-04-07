import React from 'react';
import { useAppState } from '../store/AppState';
import { 
  LayoutDashboard, Factory, Package, ShoppingCart, 
  Truck, Calculator, Users, FlaskConical, 
  MonitorPlay, Briefcase, TestTube, Calculator as CalcIcon,
  Bot, History, Menu, X, LogOut, Bell, Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const WINDOWS = [
  { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'Manufacturing', icon: Factory, label: 'Manufacturing' },
  { id: 'Inventory', icon: Package, label: 'Inventory' },
  { id: 'Sales', icon: ShoppingCart, label: 'Sales' },
  { id: 'Procurement', icon: Truck, label: 'Procurement' },
  { id: 'Vendors', icon: Users, label: 'Vendors' },
  { id: 'Accounting', icon: Calculator, label: 'Accounting' },
  { id: 'HRAdmin', icon: Users, label: 'HR & Admin' },
  { id: 'Tasks', icon: Briefcase, label: 'Task Management' },
  { id: 'RDLab', icon: FlaskConical, label: 'R&D Lab' },
  { id: 'Formulations', icon: TestTube, label: 'Formulations' },
  { id: 'IndustrialStudio', icon: MonitorPlay, label: 'Industrial Studio' },
  { id: 'BusinessDev', icon: Briefcase, label: 'Business Dev' },
  { id: 'Samples', icon: TestTube, label: 'Samples' },
  { id: 'Calculator', icon: CalcIcon, label: 'Cost & Sale Calculator' },
  { id: 'AICommand', icon: Bot, label: 'AI Command' },
  { id: 'AuditHistory', icon: History, label: 'Audit History' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { activeWindow, setActiveWindow, logout, isSidebarOpen, setSidebarOpen, user } = useAppState();

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans text-zinc-900">
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 h-full bg-zinc-900 text-zinc-300 flex flex-col border-r border-zinc-800 z-20 absolute md:relative"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center border border-zinc-600">
                  <Factory className="w-5 h-5 text-zinc-100" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">Al Wajer Pharma</span>
              </div>
              <button className="md:hidden text-zinc-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-3">Modules</div>
              {WINDOWS.map((window) => {
                const Icon = window.icon;
                const isActive = activeWindow === window.id;
                return (
                  <button
                    key={window.id}
                    onClick={() => {
                      setActiveWindow(window.id);
                      if (globalThis.window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-zinc-800 text-zinc-100 font-medium shadow-inner border border-zinc-700/50" 
                        : "hover:bg-zinc-800/50 hover:text-white"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "text-zinc-300" : "text-zinc-500")} />
                    <span>{window.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-zinc-800">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors text-zinc-400"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-zinc-800 hidden sm:block">
              {WINDOWS.find(w => w.id === activeWindow)?.label || 'Al Wajer Pharma'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-9 pr-4 py-2 bg-zinc-100 border-transparent rounded-full text-sm focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 transition-all w-64"
              />
            </div>
            
            <button className="relative p-2 rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-zinc-800 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="w-9 h-9 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center text-zinc-700 font-semibold text-sm overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user?.displayName?.charAt(0) || 'U'
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-zinc-50 p-4 lg:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWindow}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
