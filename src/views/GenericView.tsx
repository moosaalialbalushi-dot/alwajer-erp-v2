import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Download, Upload, Sparkles, Loader2, X, Bot, Printer } from 'lucide-react';
import { UniversalCrudModal, FieldSchema } from '../components/UniversalCrudModal';
import { useAppState } from '../store/AppState';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';

interface GenericViewProps { title: string; description: string; entityName: string; schema: FieldSchema[]; initialData?: any[]; }

export function GenericView({ title, description, entityName, schema }: GenericViewProps) {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addAuditLog, user } = useAppState();
  const collectionName = entityName.replace(/\s+/g, '');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => { items.push({ id: doc.id, ...doc.data() }); });
      setData(items);
    }, (error) => { console.warn(`Firestore listener error for ${collectionName}:`, error); });
    return () => unsubscribe();
  }, [collectionName, user]);

  const handleSave = async (savedData: any) => {
    try {
      if (editingItem) {
        const docRef = doc(db, collectionName, editingItem.id);
        await updateDoc(docRef, savedData);
        addAuditLog(`Updated ${entityName}`, `Updated record ID: ${editingItem.id}`);
      } else {
        const docData = { ...savedData, createdBy: user?.uid };
        const docRef = await addDoc(collection(db, collectionName), docData);
        addAuditLog(`Created ${entityName}`, `Created new record ID: ${docRef.id}`);
      }
    } catch (error) { handleFirestoreError(error, editingItem ? OperationType.UPDATE : OperationType.CREATE, collectionName); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteDoc(doc(db, collectionName, id)); addAuditLog(`Deleted ${entityName}`, `Deleted record ID: ${id}`); }
    catch (error) { handleFirestoreError(error, OperationType.DELETE, collectionName); }
  };

  const handleExport = () => {
    if (data.length === 0) return;
    const headers = schema.map(s => s.name).join(',');
    const rows = data.map(item => schema.map(s => `"${item[s.name] || ''}"`).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); const url = URL.createObjectURL(blob);
    link.setAttribute('href', url); link.setAttribute('download', `${entityName.toLowerCase()}s_export.csv`);
    link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    addAuditLog(`Exported ${entityName}`, `Exported ${data.length} records to CSV`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string; const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          const item: any = {};
          headers.forEach((header, index) => { const fieldSchema = schema.find(s => s.name === header); if (fieldSchema) { item[header] = fieldSchema.type === 'number' ? Number(values[index]) : values[index]; } });
          if (Object.keys(item).length > 0) { item.createdBy = user?.uid; await addDoc(collection(db, collectionName), item); importedCount++; }
        }
        addAuditLog(`Imported ${entityName}`, `Imported ${importedCount} records from CSV`);
        alert(`Successfully imported ${importedCount} records.`);
      } catch (error) { console.error("Import error:", error); alert("Failed to import CSV."); }
    };
    reader.readAsText(file); if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAiAnalysis = async () => {
    if (!aiPrompt.trim() || isAnalyzing) return;
    setIsAnalyzing(true); setAiResponse('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const dataJson = JSON.stringify(data.slice(0, 50));
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview', contents: `Analyze the following data for ${entityName} and answer this prompt: "${aiPrompt}".\n\nData: ${dataJson}`,
        config: { systemInstruction: "You are an expert data analyst for an enterprise ERP system. Provide concise, actionable insights based on the provided JSON data.", thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
      });
      setAiResponse(response.text || 'No insights generated.');
      addAuditLog(`AI Analysis on ${entityName}`, `Ran AI analysis with prompt: ${aiPrompt}`);
    } catch (error) { console.error("AI Analysis error:", error); setAiResponse("Failed to generate insights."); } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-zinc-900">{title}</h1><p className="text-zinc-500 mt-1">{description}</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImport} />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors text-sm font-medium" title="Import CSV"><Upload className="w-4 h-4" /><span className="hidden sm:inline">Import</span></button>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors text-sm font-medium" title="Export CSV"><Download className="w-4 h-4" /><span className="hidden sm:inline">Export</span></button>
          <button onClick={() => setIsAiModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-zinc-100 text-zinc-700 rounded-xl hover:bg-zinc-200 transition-colors text-sm font-medium" title="AI Analysis"><Sparkles className="w-4 h-4 text-zinc-600" /><span className="hidden sm:inline">AI Insights</span></button>
          <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-900 transition-colors shadow-sm shadow-zinc-200 font-medium"><Plus className="w-5 h-5" />New {entityName}</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row gap-4 justify-between bg-zinc-50/50">
          <div className="relative w-full sm:w-72"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><input type="text" placeholder={`Search ${entityName.toLowerCase()}s...`} className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all outline-none" /></div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors text-sm font-medium"><Filter className="w-4 h-4" />Filter</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-zinc-50 border-b border-zinc-200">{schema.map((field) => (<th key={field.name} className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{field.label}</th>))}<th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th></tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                  {schema.map((field) => (<td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700">{field.type === 'file' ? (item[field.name] ? <a href={item[field.name]} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">View File</a> : 'None') : item[field.name]}</td>))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (<tr><td colSpan={schema.length + 1} className="px-6 py-12 text-center text-zinc-500">No {entityName.toLowerCase()}s found. Create one or import data to get started.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
      <UniversalCrudModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} entityName={entityName} collectionName={collectionName} schema={schema} initialData={editingItem} onSave={handleSave} />
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-zinc-700" /></div><div><h2 className="text-xl font-bold text-zinc-900">AI Data Insights</h2><p className="text-sm text-zinc-500">Analyze {data.length} {entityName} records</p></div></div>
                <button onClick={() => setIsAiModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div><label className="block text-sm font-medium text-zinc-700 mb-2">What would you like to know about this data?</label>
                  <div className="flex gap-2">
                    <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g., Summarize the total value..." className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAiAnalysis()} />
                    <button onClick={handleAiAnalysis} disabled={!aiPrompt.trim() || isAnalyzing || data.length === 0} className="px-4 py-2.5 bg-zinc-800 text-white rounded-xl hover:bg-zinc-900 disabled:opacity-50 transition-colors font-medium flex items-center gap-2">{isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}Analyze</button>
                  </div>
                </div>
                {aiResponse && (<div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5"><h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2"><Bot className="w-4 h-4" />AI Analysis Result</h3><div className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">{aiResponse}</div></div>)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
