import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Volume2, Globe, Image as ImageIcon, X, BookOpen, Plus, Trash2, FileText, Brain } from 'lucide-react';
import { GoogleGenAI, Chat, ThinkingLevel } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';

interface Message { id: string; role: 'user' | 'ai'; content: string; provider?: string; audioData?: string; imageUrl?: string; fileName?: string; }
interface Skill { id: string; name: string; prompt: string; }

export function AICommand() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', content: 'Hello! I am your Al Wajer Pharma AI assistant. I can analyze data, generate reports, or answer questions about your business operations. How can I help you today?', provider: 'Gemini 3.1 Pro' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState('gemini');
  const [useSearch, setUseSearch] = useState(false);
  const [useTTS, setUseTTS] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [imageSize, setImageSize] = useState('1K');
  const [selectedFile, setSelectedFile] = useState<{ url?: string, file: File, isImage: boolean } | null>(null);
  const [skills, setSkills] = useState<Skill[]>([
    { id: 'default', name: 'General Assistant', prompt: 'You are an expert AI assistant for an enterprise ERP system called Al Wajer Pharma. You help with business analysis, data queries, and operational advice.' },
    { id: 'data', name: 'Data Analyst', prompt: 'You are an expert data analyst. Focus on providing statistical insights, identifying trends, and suggesting data-driven decisions based on the input.' },
    { id: 'formulation', name: 'Formulation Expert', prompt: 'You are a chemical and product formulation expert. Help analyze ingredients, suggest improvements, and ensure safety and compliance.' },
    { id: 'notebooklm', name: 'Notebook LM (Researcher)', prompt: 'You are an advanced research assistant similar to Google NotebookLM. Your goal is to gather sources, synthesize information, create structured summaries.' },
    { id: 'imagegen', name: 'Image Generator', prompt: 'You are an AI image generation assistant.' }
  ]);
  const [activeSkillId, setActiveSkillId] = useState('default');
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillPrompt, setNewSkillPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const isImage = file.type.startsWith('image/');
    setSelectedFile({ url: isImage ? URL.createObjectURL(file) : undefined, file, isImage });
  };

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result.split(',')[1]) : reject(new Error('Failed'));
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input, imageUrl: selectedFile?.isImage ? selectedFile.url : undefined, fileName: !selectedFile?.isImage ? selectedFile?.file.name : undefined };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input; const currentFile = selectedFile;
    setInput(''); setSelectedFile(null); setIsLoading(true);
    try {
      let ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const activeSkill = skills.find(s => s.id === activeSkillId) || skills[0];
      let responseText = ''; let audioData = undefined; let generatedImageUrl = undefined;
      if (provider === 'gemini') {
        if (activeSkillId === 'imagegen') {
          const response = await ai.models.generateContent({ model: 'gemini-3-pro-image-preview', contents: { parts: [{ text: currentInput || "Generate an image" }] }, config: { imageConfig: { aspectRatio: '1:1', imageSize } } });
          for (const part of response.candidates?.[0]?.content?.parts || []) { if (part.inlineData) { generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`; responseText = "Here is the generated image based on your prompt."; break; } }
          if (!generatedImageUrl) responseText = "Failed to generate image. Please try a different prompt.";
        } else if (currentFile) {
          const base64File = await fileToBase64(currentFile.file);
          const response = await ai.models.generateContent({ model: 'gemini-3.1-pro-preview', contents: { parts: [{ text: currentInput || "Analyze this file." }, { inlineData: { data: base64File, mimeType: currentFile.file.type } }] }, config: { systemInstruction: activeSkill.prompt, tools: useSearch ? [{ googleSearch: {} }] : undefined, thinkingConfig: useThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined } });
          responseText = response.text || 'I could not generate a response.'; chatRef.current = null;
        } else {
          if (!chatRef.current) { chatRef.current = ai.chats.create({ model: 'gemini-3.1-pro-preview', config: { systemInstruction: activeSkill.prompt, tools: useSearch ? [{ googleSearch: {} }] : undefined, thinkingConfig: useThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined } }); }
          const response = await chatRef.current.sendMessage({ message: currentInput });
          responseText = response.text || 'I could not generate a response.';
        }
        if (useTTS && activeSkillId !== 'imagegen') {
          const ttsResponse = await ai.models.generateContent({ model: "gemini-2.5-flash-preview-tts", contents: [{ parts: [{ text: responseText }] }], config: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } } });
          audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        }
      } else { await new Promise(resolve => setTimeout(resolve, 1500)); responseText = `Simulated response from ${provider === 'claude' ? 'Claude 3.5 Sonnet' : 'Qwen Max'}.`; }
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', content: responseText, provider: provider === 'gemini' ? 'Gemini 3.1 Pro' : provider === 'claude' ? 'Claude 3.5 Sonnet (Simulated)' : 'Qwen Max (Simulated)', audioData, imageUrl: generatedImageUrl }]);
    } catch (error) { console.error("AI Error:", error); setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', content: 'Sorry, I encountered an error processing your request.', provider: 'System' }]); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3"><div className="w-10 h-10 bg-zinc-200 rounded-xl flex items-center justify-center"><Bot className="w-6 h-6 text-zinc-700" /></div><div><h2 className="font-bold text-zinc-900">Al Wajer Pharma AI Command</h2><p className="text-xs text-zinc-500">Multi-Provider Intelligence</p></div></div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSkillsModalOpen(true)} className="px-3 py-1.5 rounded-lg bg-zinc-200 text-zinc-700 hover:bg-zinc-300 transition-colors flex items-center gap-2 text-sm font-medium"><BookOpen className="w-4 h-4" /><span className="hidden sm:inline">Skills</span></button>
            <select value={activeSkillId} onChange={(e) => { setActiveSkillId(e.target.value); chatRef.current = null; }} className="bg-white border border-zinc-200 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-zinc-500 outline-none max-w-[150px]">{skills.map(skill => (<option key={skill.id} value={skill.id}>{skill.name}</option>))}</select>
            <div className="w-px h-6 bg-zinc-300 mx-1"></div>
            <button onClick={() => setUseSearch(!useSearch)} className={`p-2 rounded-lg transition-colors ${useSearch ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'}`} title="Toggle Google Search"><Globe className="w-4 h-4" /></button>
            <button onClick={() => { setUseThinking(!useThinking); chatRef.current = null; }} className={`p-2 rounded-lg transition-colors ${useThinking ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'}`} title="Toggle Thinking"><Brain className="w-4 h-4" /></button>
            <button onClick={() => setUseTTS(!useTTS)} className={`p-2 rounded-lg transition-colors ${useTTS ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'}`} title="Toggle TTS"><Volume2 className="w-4 h-4" /></button>
          </div>
          <select value={provider} onChange={(e) => { setProvider(e.target.value); chatRef.current = null; }} className="bg-white border border-zinc-200 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-zinc-500 outline-none"><option value="gemini">Gemini 3.1 Pro</option><option value="claude">Claude 3.5 Sonnet</option><option value="qwen">Qwen Max</option></select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-zinc-700'}`}>{msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}</div>
            <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-5 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-zinc-800 text-white rounded-tr-sm' : 'bg-zinc-100 text-zinc-800 rounded-tl-sm'}`}>
                {msg.imageUrl && <img src={msg.imageUrl} alt="Uploaded" className="max-w-full h-auto rounded-lg mb-3 border border-zinc-300/30" />}
                {msg.fileName && <div className="flex items-center gap-2 mb-3 p-2 bg-zinc-700 rounded-lg text-zinc-200 text-sm"><FileText className="w-4 h-4" /><span className="truncate">{msg.fileName}</span></div>}
                {msg.content && <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>}
                {msg.audioData && <button onClick={() => { const audio = new Audio(`data:audio/pcm;rate=24000;base64,${msg.audioData}`); audio.play(); }} className="mt-2 flex items-center gap-2 text-xs bg-zinc-200 hover:bg-zinc-300 text-zinc-700 px-3 py-1.5 rounded-lg transition-colors"><Volume2 className="w-3 h-3" />Play Audio</button>}
              </div>
              {msg.provider && <span className="text-[10px] text-zinc-400 mt-1 px-1">{msg.provider}</span>}
            </div>
          </motion.div>
        ))}
        {isLoading && (<div className="flex gap-4"><div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center flex-shrink-0"><Sparkles className="w-4 h-4" /></div><div className="bg-zinc-100 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-zinc-600" /><span className="text-sm text-zinc-500">Thinking...</span></div></div>)}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-zinc-200 flex flex-col gap-3">
        {selectedFile && (<div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-xl border border-zinc-200 w-fit">{selectedFile.isImage ? <img src={selectedFile.url} alt="Preview" className="w-12 h-12 object-cover rounded-lg" /> : <div className="w-12 h-12 bg-zinc-200 rounded-lg flex items-center justify-center"><FileText className="w-6 h-6 text-zinc-500" /></div>}<span className="text-sm text-zinc-600 truncate max-w-[150px]">{selectedFile.file.name}</span><button onClick={() => setSelectedFile(null)} className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-md transition-colors"><X className="w-4 h-4" /></button></div>)}
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3.5 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-colors border border-zinc-200" title="Upload File"><ImageIcon className="w-5 h-5" /></button>
          <div className="relative flex-1"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Ask AI (${skills.find(s => s.id === activeSkillId)?.name})...`} className="w-full pl-4 pr-14 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all outline-none" disabled={isLoading} /><button type="submit" disabled={(!input.trim() && !selectedFile) || isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Send className="w-4 h-4" /></button></div>
        </form>
      </div>
      <AnimatePresence>
        {isSkillsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-zinc-100"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5 text-zinc-700" /></div><div><h2 className="text-xl font-bold text-zinc-900">AI Skills Management</h2><p className="text-sm text-zinc-500">Create and manage custom AI personas</p></div></div><button onClick={() => setIsSkillsModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button></div>
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-4"><h3 className="font-medium text-zinc-900">Create New Skill</h3><div className="space-y-3"><input type="text" placeholder="Skill Name" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 outline-none" /><textarea placeholder="System Prompt" value={newSkillPrompt} onChange={(e) => setNewSkillPrompt(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 outline-none h-24 resize-none" /><button onClick={() => { if (!newSkillName.trim() || !newSkillPrompt.trim()) return; setSkills([...skills, { id: Date.now().toString(), name: newSkillName, prompt: newSkillPrompt }]); setNewSkillName(''); setNewSkillPrompt(''); }} disabled={!newSkillName.trim() || !newSkillPrompt.trim()} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-900 transition-colors disabled:opacity-50 text-sm font-medium"><Plus className="w-4 h-4" />Add Skill</button></div></div>
                <div className="space-y-3"><h3 className="font-medium text-zinc-900">Your Skills</h3>{skills.map(skill => (<div key={skill.id} onClick={() => { setActiveSkillId(skill.id); chatRef.current = null; setIsSkillsModalOpen(false); }} className={`flex items-start justify-between p-4 border rounded-xl transition-colors cursor-pointer ${activeSkillId === skill.id ? 'border-zinc-800 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}`}><div className="flex-1 pr-4"><div className="flex items-center gap-2"><h4 className="font-medium text-zinc-900">{skill.name}</h4>{activeSkillId === skill.id && <span className="px-2 py-0.5 bg-zinc-800 text-white text-[10px] uppercase font-bold rounded-full">Active</span>}</div><p className="text-sm text-zinc-500 mt-1 line-clamp-2">{skill.prompt}</p></div>{skill.id !== 'default' && <button onClick={(e) => { e.stopPropagation(); setSkills(skills.filter(s => s.id !== skill.id)); if (activeSkillId === skill.id) setActiveSkillId('default'); }} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>}</div>))}</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
