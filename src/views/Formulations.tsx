import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Sparkles, Loader2, X, Beaker } from 'lucide-react';
import { useAppState } from '../store/AppState';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';

interface Ingredient { name: string; quantity: number; unit: string; unitRate: number; cost: number; }
interface Formulation { id?: string; formulationId: string; name: string; version: string; status: string; ingredients: Ingredient[]; createdBy?: string; }

export function Formulations() {
  const [data, setData] = useState<Formulation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Formulation | null>(null);
  const [formulationId, setFormulationId] = useState('');
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0');
  const [status, setStatus] = useState('Draft');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isAiImporting, setIsAiImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addAuditLog, user } = useAppState();
  const collectionName = 'Formulation';

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Formulation[] = [];
      snapshot.forEach((d) => {
        const docData = d.data();
        let parsed: Ingredient[] = [];
        try { parsed = typeof docData.ingredients === 'string' ? JSON.parse(docData.ingredients) : docData.ingredients; } catch { parsed = []; }
        items.push({ id: d.id, ...docData, ingredients: parsed || [] } as Formulation);
      });
      setData(items);
    }, (error) => { console.warn('Formulation listener error:', error); });
    return () => unsubscribe();
  }, [user]);

  const openCreate = () => { setEditingItem(null); setFormulationId(`FML-${Math.floor(Math.random() * 10000)}`); setName(''); setVersion('1.0'); setStatus('Draft'); setIngredients([]); setIsModalOpen(true); };
  const openEdit = (item: Formulation) => { setEditingItem(item); setFormulationId(item.formulationId); setName(item.name); setVersion(item.version); setStatus(item.status); setIngredients(item.ingredients || []); setIsModalOpen(true); };

  const handleSave = async () => {
    if (!name || !formulationId) return;
    const savedData = { formulationId, name, version, status, ingredients: JSON.stringify(ingredients) };
    try {
      if (editingItem?.id) { await updateDoc(doc(db, collectionName, editingItem.id), savedData); addAuditLog('Updated Formulation', `Updated: ${editingItem.id}`); }
      else { const docRef = await addDoc(collection(db, collectionName), { ...savedData, createdBy: user?.uid }); addAuditLog('Created Formulation', `Created: ${docRef.id}`); }
      setIsModalOpen(false);
    } catch (error) { handleFirestoreError(error, editingItem ? OperationType.UPDATE : OperationType.CREATE, collectionName); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this formulation?')) return;
    try { await deleteDoc(doc(db, collectionName, id)); addAuditLog('Deleted Formulation', `Deleted: ${id}`); }
    catch (error) { handleFirestoreError(error, OperationType.DELETE, collectionName); }
  };

  const addIngredient = () => { setIngredients([...ingredients, { name: '', quantity: 0, unit: 'KG', unitRate: 0, cost: 0 }]); };
  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    const newIng = [...ingredients]; newIng[index] = { ...newIng[index], [field]: value };
    if (field === 'quantity' || field === 'unitRate') { const qty = field === 'quantity' ? Number(value) : newIng[index].quantity; const rate = field === 'unitRate' ? Number(value) : newIng[index].unitRate || 0; newIng[index].cost = qty * rate; }
    setIngredients(newIng);
  };

  const handleAiImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsAiImporting(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.readAsDataURL(file); r.onload = () => typeof r.result === 'string' ? resolve(r.result.split(',')[1]) : reject(); r.onerror = reject; });
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({ model: 'gemini-3.1-pro-preview', contents: { parts: [{ text: 'Analyze this file which contains ingredients for a formulation. Extract and return strictly as a JSON array of objects with keys: "name" (string), "quantity" (number), "unit" (string), "cost" (number). No markdown.' }, { inlineData: { data: base64, mimeType: file.type } }] }, config: { thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } } });
      let jsonText = (response.text || '[]').replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) { setIngredients([...ingredients, ...parsed]); addAuditLog('AI Formulation Import', `Imported ${parsed.length} ingredients via AI`); }
    } catch (error) { console.error("AI Import Error:", error); alert("Failed to parse ingredients."); }
    finally { setIsAiImporting(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-zinc-900">Formulations</h1><p className="text-zinc-500 mt-1">Manage chemical and product formulations, ingredients, and costs.</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-900 transition-colors shadow-sm font-medium"><Plus className="w-5 h-5" />New Formulation</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Beaker className="w-5 h-5" /></div><div><h3 className="font-bold text-zinc-900">{item.name}</h3><p className="text-xs text-zinc-500">{item.formulationId} • v{item.version}</p></div></div>
              <div className="flex gap-1"><button onClick={() => openEdit(item)} className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button><button onClick={() => item.id && handleDelete(item.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Status</span><span className={`font-medium ${item.status === 'Approved' ? 'text-emerald-600' : 'text-amber-600'}`}>{item.status}</span></div>
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Ingredients</span><span className="font-medium text-zinc-900">{item.ingredients?.length || 0} items</span></div>
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Total Cost</span><span className="font-medium text-zinc-900">${item.ingredients?.reduce((sum, ing) => sum + (Number(ing.cost) || 0), 0).toFixed(2)}</span></div>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="col-span-full py-12 text-center text-zinc-500 bg-white rounded-2xl border border-zinc-200 border-dashed">No formulations found.</div>}
      </div>
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-zinc-100"><h2 className="text-xl font-bold text-zinc-900">{editingItem ? 'Edit' : 'New'} Formulation</h2><button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button></div>
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div><label className="block text-sm font-medium text-zinc-700 mb-1">Formulation ID</label><input type="text" value={formulationId} onChange={e => setFormulationId(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-zinc-700 mb-1">Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-zinc-700 mb-1">Version</label><input type="text" value={version} onChange={e => setVersion(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-zinc-700 mb-1">Status</label><select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 outline-none"><option value="Draft">Draft</option><option value="Approved">Approved</option><option value="Archived">Archived</option></select></div>
                </div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-zinc-900">Ingredients ({ingredients.length})</h3>
                  <div className="flex gap-2">
                    <input type="file" accept="image/*,.csv,.xlsx" className="hidden" ref={fileInputRef} onChange={handleAiImport} />
                    <button onClick={() => fileInputRef.current?.click()} disabled={isAiImporting} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium disabled:opacity-50">{isAiImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}AI Import</button>
                    <button onClick={addIngredient} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors text-sm font-medium"><Plus className="w-4 h-4" />Add Row</button>
                  </div>
                </div>
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-zinc-50 border-b border-zinc-200"><th className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase">Name</th><th className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase w-32">Qty</th><th className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase w-24">Unit</th><th className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase w-32">Unit Rate</th><th className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase w-32">Total Cost</th><th className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase w-16"></th></tr></thead>
                    <tbody className="divide-y divide-zinc-100">
                      {ingredients.map((ing, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50">
                          <td className="px-4 py-2"><input type="text" value={ing.name} onChange={e => updateIngredient(idx, 'name', e.target.value)} className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-zinc-200 focus:border-zinc-300 rounded outline-none text-sm" placeholder="Name" /></td>
                          <td className="px-4 py-2"><input type="number" value={ing.quantity} onChange={e => updateIngredient(idx, 'quantity', Number(e.target.value))} className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-zinc-200 focus:border-zinc-300 rounded outline-none text-sm" /></td>
                          <td className="px-4 py-2"><input type="text" value={ing.unit} onChange={e => updateIngredient(idx, 'unit', e.target.value)} className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-zinc-200 focus:border-zinc-300 rounded outline-none text-sm" /></td>
                          <td className="px-4 py-2"><input type="number" value={ing.unitRate || 0} onChange={e => updateIngredient(idx, 'unitRate', Number(e.target.value))} className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-zinc-200 focus:border-zinc-300 rounded outline-none text-sm" /></td>
                          <td className="px-4 py-2"><input type="number" value={ing.cost} readOnly className="w-full px-2 py-1 bg-transparent border border-transparent rounded outline-none text-sm font-medium" /></td>
                          <td className="px-4 py-2 text-right"><button onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))} className="p-1 text-zinc-400 hover:text-red-600 rounded transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                      {ingredients.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-500">No ingredients added.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3"><button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-600 hover:text-zinc-900 font-medium transition-colors">Cancel</button><button onClick={handleSave} className="px-6 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-900 transition-colors font-medium shadow-sm">Save Formulation</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
