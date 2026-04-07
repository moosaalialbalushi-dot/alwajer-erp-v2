import React, { useState } from 'react';
import { useAppState } from '../store/AppState';
import { TrendingUp, Users, Package, DollarSign, ArrowUpRight, ArrowDownRight, Activity, CheckSquare, Settings, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

const revenueData = [
  { name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 }, { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 }, { name: 'May', value: 6000 }, { name: 'Jun', value: 5500 },
];
const productionData = [
  { name: 'Week 1', target: 4000, actual: 2400 }, { name: 'Week 2', target: 3000, actual: 1398 },
  { name: 'Week 3', target: 2000, actual: 9800 }, { name: 'Week 4', target: 2780, actual: 3908 },
];

export function Dashboard() {
  const { dashboardConfig, setDashboardConfig, setActiveWindow } = useAppState();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const stats = [
    { title: 'Total Revenue', value: '$2.4M', change: '+12.5%', isPositive: true, icon: DollarSign, color: 'bg-zinc-800' },
    { title: 'Active Projects', value: '45', change: '+5.2%', isPositive: true, icon: Activity, color: 'bg-zinc-700' },
    { title: 'Pending Tasks', value: '12', change: '-3.1%', isPositive: true, icon: CheckSquare, color: 'bg-zinc-600' },
    { title: 'Total Employees', value: '124', change: '+1.2%', isPositive: true, icon: Users, color: 'bg-zinc-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-zinc-900">Dashboard Overview</h1><p className="text-zinc-500 mt-1">Welcome back to Al Wajer Pharma</p></div>
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm" title="Customize Dashboard"><Settings className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          if (stat.title === 'Pending Tasks' && !dashboardConfig.showTasks) return null;
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color} shadow-sm`}><Icon className="w-6 h-6" /></div>
                <div className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700`}>
                  {stat.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}{stat.change}
                </div>
              </div>
              <h3 className="text-zinc-500 text-sm font-medium">{stat.title}</h3>
              <p className="text-3xl font-bold text-zinc-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboardConfig.showRevenue && (
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-6">Revenue Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#52525b" stopOpacity={0.3}/><stop offset="95%" stopColor="#52525b" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke="#52525b" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-6">Production vs Target</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="target" name="Target" fill="#d4d4d8" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="actual" name="Actual" fill="#52525b" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {dashboardConfig.showAIInsights && (
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm"><TrendingUp className="w-5 h-5 text-zinc-300" /></div><h3 className="text-lg font-bold">AI Executive Summary</h3></div>
            <p className="text-zinc-300 leading-relaxed max-w-3xl">Based on recent data, production efficiency has increased by 12% this week. However, inventory levels for raw material 'Aluminum Alloy 6061' are projected to fall below safety stock in 4 days. Recommendation: Expedite PO #49281 to avoid manufacturing delays.</p>
            <button onClick={() => setActiveWindow('AICommand')} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors border border-white/10">View Detailed Analysis</button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-zinc-100"><h2 className="text-xl font-bold text-zinc-900">Customize Dashboard</h2><button onClick={() => setIsSettingsOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button></div>
              <div className="p-6 space-y-6">
                {[{key: 'showRevenue', title: 'Show Revenue Trend', desc: 'Display the revenue chart'}, {key: 'showAIInsights', title: 'Show AI Insights', desc: 'Display the AI executive summary'}, {key: 'showTasks', title: 'Show Pending Tasks', desc: 'Display the pending tasks stat card'}].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div><h3 className="font-medium text-zinc-900">{item.title}</h3><p className="text-sm text-zinc-500">{item.desc}</p></div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={(dashboardConfig as any)[item.key]} onChange={(e) => setDashboardConfig({ ...dashboardConfig, [item.key]: e.target.checked })} />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-800"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
