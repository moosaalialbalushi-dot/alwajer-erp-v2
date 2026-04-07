import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Paperclip, ExternalLink, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadAttachment, deleteAttachment, isStorageUrl, UploadProgress } from '../lib/storage';
import { auth } from '../firebase';

export interface FieldSchema {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  options?: { label: string; value: string }[];
  required?: boolean;
}

interface UniversalCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityName: string;
  collectionName?: string;
  schema: FieldSchema[];
  initialData?: any;
  onSave: (data: any) => void;
}

export function UniversalCrudModal({ isOpen, onClose, entityName, collectionName, schema, initialData, onSave }: UniversalCrudModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData ?? {});
      setPendingFiles({});
      setUploadProgress({});
      setSaveError(null);
    }
  }, [isOpen, initialData]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (fieldName: string, file: File | null) => {
    if (!file) return;
    setPendingFiles((prev) => ({ ...prev, [fieldName]: file }));
    setFormData((prev) => ({ ...prev, [fieldName]: `pending:${file.name}` }));
  };

  const handleRemoveFile = (fieldName: string) => {
    setPendingFiles((prev) => { const next = { ...prev }; delete next[fieldName]; return next; });
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const finalData = { ...formData };
      const col = collectionName ?? entityName.replace(/\s+/g, '');
      await Promise.all(
        Object.entries(pendingFiles).map(async ([fieldName, file]) => {
          const downloadURL = await uploadAttachment(file, col, (progress) => {
            setUploadProgress((prev) => ({ ...prev, [fieldName]: progress }));
          });
          finalData[fieldName] = downloadURL;
        }),
      );
      onSave(finalData);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(`Save failed: ${msg}`);
    } finally {
      setIsSaving(false);
      setUploadProgress({});
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h3 className="text-lg font-semibold text-zinc-800">{initialData ? 'Edit' : 'Create'} {entityName}</h3>
              <button onClick={onClose} disabled={isSaving} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors disabled:opacity-50"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="crud-form" onSubmit={handleSubmit} className="space-y-4">
                {schema.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                    {field.type === 'text' && <input type="text" required={field.required} value={formData[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all outline-none" />}
                    {field.type === 'number' && <input type="number" required={field.required} value={formData[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all outline-none" />}
                    {field.type === 'date' && <input type="date" required={field.required} value={formData[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all outline-none" />}
                    {field.type === 'textarea' && <textarea required={field.required} value={formData[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} rows={3} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all outline-none resize-none" />}
                    {field.type === 'select' && (
                      <select required={field.required} value={formData[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all outline-none">
                        <option value="">Select…</option>
                        {field.options?.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                      </select>
                    )}
                    {field.type === 'file' && (
                      <div className="space-y-2">
                        {(isStorageUrl(formData[field.name]) || pendingFiles[field.name]) ? (
                          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm">
                            <Paperclip className="w-4 h-4 text-zinc-400 shrink-0" />
                            {isStorageUrl(formData[field.name]) ? (
                              <a href={formData[field.name]} target="_blank" rel="noreferrer" className="flex-1 text-indigo-600 hover:underline truncate flex items-center gap-1">View attachment <ExternalLink className="w-3 h-3 shrink-0" /></a>
                            ) : (
                              <span className="flex-1 text-zinc-600 truncate">{pendingFiles[field.name]?.name}</span>
                            )}
                            <button type="button" onClick={() => handleRemoveFile(field.name)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-2 w-full px-4 py-2 bg-zinc-50 border border-zinc-200 border-dashed rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors text-sm text-zinc-500">
                            <Paperclip className="w-4 h-4" /><span>Choose file to attach…</span>
                            <input type="file" required={field.required && !formData[field.name]} className="hidden" onChange={(e) => handleFileSelect(field.name, e.target.files?.[0] ?? null)} />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </form>
            </div>
            {saveError && <div className="mx-6 mb-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{saveError}</div>}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
              <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-200 bg-zinc-100 rounded-xl transition-colors disabled:opacity-50">Cancel</button>
              <button type="submit" form="crud-form" disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-900 rounded-xl shadow-sm shadow-zinc-200 transition-all flex items-center gap-2 disabled:opacity-60">
                {isSaving ? (<><Loader2 className="w-4 h-4 animate-spin" />Saving…</>) : (<><Save className="w-4 h-4" />Save {entityName}</>)}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
