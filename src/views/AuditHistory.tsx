import React from 'react';
import { useAppState } from '../store/AppState';
import { format } from 'date-fns';
import { History, ShieldAlert, User, Clock } from 'lucide-react';

export function AuditHistory() {
  const { auditLogs } = useAppState();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit History</h1>
          <p className="text-slate-500 mt-1">System-wide activity and security logs</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
          <ShieldAlert className="w-4 h-4" />
          <span className="text-sm font-medium">Immutable Ledger Active</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            Recent Activity
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />{log.user}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No audit logs recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
