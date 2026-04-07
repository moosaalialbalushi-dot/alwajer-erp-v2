import React, { useState } from 'react';
import { Calculator as CalcIcon, Plus, Trash2, Printer, FileText } from 'lucide-react';
import { useAppState } from '../store/AppState';
import { motion, AnimatePresence } from 'motion/react';

interface CostItem { id: string; name: string; unitRate: number; packaging: number; qc: number; overhead: number; labor: number; salesPrice: number; quantity: number; }

export function CostSaleCalculator() {
  const [items, setItems] = useState<CostItem[]>([{ id: '1', name: 'Product A', unitRate: 0, packaging: 0, qc: 0, overhead: 0, labor: 0, salesPrice: 0, quantity: 1 }]);
  const [customerName, setCustomerName] = useState('');
  const [showQuotation, setShowQuotation] = useState(false);
  const { addAuditLog } = useAppState();

  const addItem = () => { setItems([...items, { id: Date.now().toString(), name: `Product ${items.length + 1}`, unitRate: 0, packaging: 0, qc: 0, overhead: 0, labor: 0, salesPrice: 0, quantity: 1 }]); };
  const updateItem = (id: string, field: keyof CostItem, value: any) => { setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item)); };
  const removeItem = (id: string) => { setItems(items.filter(item => item.id !== id)); };

  const calcCost = (item: CostItem) => { const base = item.unitRate * item.quantity; return base + (item.packaging + item.qc + item.overhead + item.labor) * item.quantity; };
  const calcSales = (item: CostItem) => item.salesPrice * item.quantity;
  const calcMargin = (item: CostItem) => calcSales(item) - calcCost(item);
  const calcMarginPct = (item: CostItem) => { const s = calcSales(item); return s === 0 ? 0 : (calcMargin(item) / s) * 100; };

  const totalSales = items.reduce((sum, item) => sum + calcSales(item), 0);
  const totalCost = items.reduce((sum, item) => sum + calcCost(item), 0);
  const totalMargin = totalSales - totalCost;
  const totalMarginPct = totalSales > 0 ? (totalMargin / totalSales) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div><h1 className="text-2xl font-bold text-zinc-900">Cost & Sale Calculator</h1><p className="text-zinc-500 mt-1">Calculate product costs, margins, and generate quotations.</p></div>
        <div className="flex gap-2">
          <button onClick={() => setShowQuotation(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl hover:bg-zinc-200 transition-colors font-medium"><FileText className="w-5 h-5" />Preview Quotation</button>
          <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-900 transition-colors shadow-sm shadow-zinc-200 font-medium"><Plus className="w-5 h-5" />Add Product</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden print:hidden">
        <div className="p-6 border-b border-zinc-200 bg-zinc-50/50"><div className="max-w-md"><label className="block text-sm font-medium text-zinc-700 mb-1">Customer Name (For Quotation)</label><input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Enter customer name..." className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 outline-none" /></div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead><tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Product Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase w-24">Qty (KG)</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase w-28">Unit Rate</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase w-28">Packaging</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase w-28">QC</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase w-28">Overhead</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase w-28">Labor</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase w-32 bg-indigo-50/50">Sales Price</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase w-32 bg-emerald-50/50">Margin</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase w-12"></th>
            </tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/50">
                  <td className="px-4 py-3"><input type="text" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-zinc-200 focus:border-zinc-300 rounded outline-none text-sm font-medium" /></td>
                  <td className="px-4 py-3"><input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-zinc-200 focus:border-zinc-300 rounded outline-none text-sm" /></td>
                  {(['unitRate', 'packaging', 'qc', 'overhead', 'labor'] as const).map(f => (
                    <td key={f} className="px-4 py-3"><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">$</span><input type="number" value={item[f]} onChange={e => updateItem(item.id, f, Number(e.target.value))} className="w-full pl-6 pr-2 py-1.5 bg-transparent border border-transparent hover:border-zinc-200 focus:border-zinc-300 rounded outline-none text-sm" /></div></td>
                  ))}
                  <td className="px-4 py-3 bg-indigo-50/30"><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-indigo-400 text-xs">$</span><input type="number" value={item.salesPrice} onChange={e => updateItem(item.id, 'salesPrice', Number(e.target.value))} className="w-full pl-6 pr-2 py-1.5 bg-transparent border border-transparent hover:border-indigo-200 focus:border-indigo-300 rounded outline-none text-sm font-bold text-indigo-700" /></div></td>
                  <td className="px-4 py-3 bg-emerald-50/30"><div className="text-sm font-bold text-emerald-700">${calcMargin(item).toFixed(2)}<span className="block text-xs font-normal text-emerald-600/70">{calcMarginPct(item).toFixed(1)}%</span></div></td>
                  <td className="px-4 py-3 text-right"><button onClick={() => removeItem(item.id)} className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-zinc-50 border-t border-zinc-200"><tr>
              <td colSpan={7} className="px-4 py-4 text-right font-semibold text-zinc-600">Invoice Totals:</td>
              <td className="px-4 py-4 font-bold text-indigo-700 text-lg">${totalSales.toFixed(2)}</td>
              <td className="px-4 py-4 font-bold text-emerald-700 text-lg">${totalMargin.toFixed(2)}<span className="block text-xs font-normal text-emerald-600/70">{totalMarginPct.toFixed(1)}% overall</span></td>
              <td></td>
            </tr></tfoot>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showQuotation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                <h2 className="text-xl font-bold text-zinc-900">Quotation Preview</h2>
                <div className="flex gap-2">
                  <button onClick={() => { addAuditLog('Generated Quotation', `Printed quotation for ${customerName || 'Unknown Customer'}`); window.print(); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"><Printer className="w-4 h-4" />Print / PDF</button>
                  <button onClick={() => setShowQuotation(false)} className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors font-medium">Close</button>
                </div>
              </div>
              <div className="p-10 flex-1 overflow-y-auto bg-white text-zinc-900">
                <div className="max-w-3xl mx-auto">
                  <div className="flex justify-between items-start mb-12 border-b border-zinc-200 pb-8">
                    <div><h1 className="text-4xl font-light tracking-tight text-zinc-900 mb-2">QUOTATION</h1><p className="text-zinc-500">Date: {new Date().toLocaleDateString()}</p><p className="text-zinc-500">Quote #: QTE-{Math.floor(Math.random() * 10000)}</p></div>
                    <div className="text-right"><h2 className="text-xl font-bold text-zinc-900">Al Wajer Pharma</h2><p className="text-zinc-500">Muscat, Oman</p></div>
                  </div>
                  <div className="mb-10"><h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Prepared For</h3><p className="text-lg font-medium text-zinc-900">{customerName || 'Valued Customer'}</p></div>
                  <table className="w-full text-left border-collapse mb-10">
                    <thead><tr className="border-b-2 border-zinc-900"><th className="py-3 font-bold text-zinc-900">Description</th><th className="py-3 font-bold text-zinc-900 text-center">Qty</th><th className="py-3 font-bold text-zinc-900 text-right">Unit Price (USD)</th><th className="py-3 font-bold text-zinc-900 text-right">Total (USD)</th></tr></thead>
                    <tbody className="divide-y divide-zinc-200">{items.map((item) => (<tr key={item.id}><td className="py-4 font-medium text-zinc-800">{item.name}</td><td className="py-4 text-center text-zinc-600">{item.quantity}</td><td className="py-4 text-right text-zinc-600">${item.salesPrice.toFixed(2)}</td><td className="py-4 text-right font-medium text-zinc-900">${(item.salesPrice * item.quantity).toFixed(2)}</td></tr>))}</tbody>
                  </table>
                  <div className="flex justify-end"><div className="w-64 space-y-3"><div className="flex justify-between text-zinc-600"><span>Subtotal</span><span>${totalSales.toFixed(2)}</span></div><div className="flex justify-between text-zinc-600"><span>Tax (0%)</span><span>$0.00</span></div><div className="flex justify-between text-xl font-bold text-zinc-900 border-t border-zinc-200 pt-3"><span>Total Due</span><span>${totalSales.toFixed(2)}</span></div><div className="flex justify-between text-sm font-medium text-zinc-500 pt-1"><span>Total (OMR)</span><span>~{(totalSales * 0.385).toFixed(2)} OMR</span></div></div></div>
                  <div className="mt-16 pt-8 border-t border-zinc-200 text-sm text-zinc-500 text-center"><p>Thank you for your business. Quotation valid for 30 days.</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
