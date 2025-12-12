import React from 'react';
import { Download, ArrowLeft, Check, RefreshCw } from 'lucide-react';
import Button from './Button';

interface GeneratedResultProps {
  originalImage: string;
  generatedImage: string;
  onReset: () => void;
  onRegenerate: () => void;
}

const GeneratedResult: React.FC<GeneratedResultProps> = ({ 
  originalImage, 
  generatedImage, 
  onReset,
  onRegenerate
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${generatedImage}`;
    link.download = `stockified-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <button 
          onClick={onReset}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Editor
        </button>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onRegenerate}>
             <RefreshCw className="w-4 h-4 mr-2" />
             Try Again
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download HD Image
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Original Upload</h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Before</span>
          </div>
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-square shadow-inner">
            <img 
              src={`data:image/png;base64,${originalImage}`} 
              alt="Original" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Generated */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-indigo-700">Stock Quality Result</h3>
             <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded flex items-center">
                <Check className="w-3 h-3 mr-1" />
                Enhanced
             </span>
          </div>
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-indigo-200 aspect-square shadow-xl ring-4 ring-indigo-50 ring-offset-2">
            <img 
              src={`data:image/png;base64,${generatedImage}`} 
              alt="Generated" 
              className="w-full h-full object-contain"
            />
            
            <div className="absolute top-4 right-4">
               <span className="bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md font-medium border border-white/20">
                 AI Generated
               </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800 flex items-start gap-3">
        <div className="bg-indigo-100 p-1.5 rounded-full mt-0.5">
          <SparklesIcon className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <p className="font-semibold">Pro Tip:</p>
          <p className="opacity-90 mt-0.5">If the result isn't perfect, try adjusting your prompt to be more specific about the lighting style (e.g., "cinematic lighting", "bright daylight") or the specific object you want to remove.</p>
        </div>
      </div>
    </div>
  );
};

// Small icon helper for this file
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214z" />
  </svg>
);

export default GeneratedResult;
