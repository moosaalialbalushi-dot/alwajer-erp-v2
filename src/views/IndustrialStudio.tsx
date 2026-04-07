import React, { useState } from 'react';
import { GenericView } from './GenericView';
import { Image as ImageIcon, Sparkles, Loader2, Download } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export function IndustrialStudio() {
  const [activeTab, setActiveTab] = useState<'designs' | 'generator'>('designs');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<'512px' | '1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('1:1');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true); setGeneratedImage(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({ model: 'gemini-3.1-flash-image-preview', contents: { parts: [{ text: prompt }] }, config: { imageConfig: { aspectRatio, imageSize } } });
      for (const part of response.candidates?.[0]?.content?.parts || []) { if (part.inlineData) { setGeneratedImage(`data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`); break; } }
    } catch (error) { console.error("Image generation error:", error); alert("Failed to generate image."); }
    finally { setIsGenerating(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-zinc-900">Industrial Studio</h1><p className="text-zinc-500 mt-1">Design, CAD files, and AI image generation.</p></div>
        <div className="flex bg-zinc-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('designs')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'designs' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>Designs</button>
          <button onClick={() => setActiveTab('generator')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'generator' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}><Sparkles className="w-4 h-4" />AI Generator</button>
        </div>
      </div>
      {activeTab === 'designs' ? (
        <GenericView title="" description="" entityName="Design" schema={[
          { name: 'designId', label: 'Design ID', type: 'text', required: true },
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'version', label: 'Version', type: 'text', required: true },
          { name: 'status', label: 'Status', type: 'select', options: [{label: 'Draft', value: 'Draft'}, {label: 'Review', value: 'Review'}, {label: 'Approved', value: 'Approved'}], required: true },
          { name: 'lastModified', label: 'Last Modified', type: 'date' },
          { name: 'attachment', label: 'Attachment', type: 'file' }
        ]} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col md:flex-row h-[calc(100vh-12rem)]">
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-200 p-6 flex flex-col bg-zinc-50/50">
            <h3 className="font-semibold text-zinc-900 mb-6 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-zinc-500" />Image Settings</h3>
            <form onSubmit={handleGenerate} className="space-y-6 flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div><label className="block text-sm font-medium text-zinc-700 mb-2">Prompt</label><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the product or design..." className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all outline-none resize-none h-32" required /></div>
                <div><label className="block text-sm font-medium text-zinc-700 mb-2">Size</label><select value={imageSize} onChange={(e) => setImageSize(e.target.value as any)} className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 outline-none"><option value="512px">512px</option><option value="1K">1K</option><option value="2K">2K</option><option value="4K">4K</option></select></div>
                <div><label className="block text-sm font-medium text-zinc-700 mb-2">Aspect Ratio</label><select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as any)} className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 outline-none"><option value="1:1">1:1</option><option value="4:3">4:3</option><option value="16:9">16:9</option><option value="3:4">3:4</option><option value="9:16">9:16</option></select></div>
              </div>
              <button type="submit" disabled={!prompt.trim() || isGenerating} className="w-full py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-900 disabled:opacity-50 transition-colors shadow-sm font-medium flex items-center justify-center gap-2 mt-auto">{isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" />Generating...</> : <><Sparkles className="w-5 h-5" />Generate Image</>}</button>
            </form>
          </div>
          <div className="flex-1 p-6 flex flex-col items-center justify-center bg-zinc-100/50">
            {generatedImage ? (
              <div className="relative group max-w-full max-h-full flex flex-col items-center">
                <img src={generatedImage} alt="Generated design" className="max-w-full max-h-[calc(100vh-16rem)] object-contain rounded-xl shadow-md border border-zinc-200" referrerPolicy="no-referrer" />
                <a href={generatedImage} download="alwajer-generated-design.png" className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-zinc-800 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" title="Download"><Download className="w-5 h-5" /></a>
              </div>
            ) : (
              <div className="text-center text-zinc-400 flex flex-col items-center"><ImageIcon className="w-16 h-16 mb-4 opacity-20" /><p>Your generated design will appear here</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
