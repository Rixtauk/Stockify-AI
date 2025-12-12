import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import GeneratedResult from './components/GeneratedResult';
import ImageEditor, { ImageEditorRef } from './components/ImageEditor';
import Button from './components/Button';
import { AppStatus, ImageAsset, StockStyle } from './types';
import { generateEditedImage } from './services/geminiService';
import { Wand2, X, Eraser, LayoutTemplate, Sun, Camera, Box, User, Building, Film } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [originalImage, setOriginalImage] = useState<ImageAsset | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // New State
  const [selectedStyle, setSelectedStyle] = useState<StockStyle>('standard');
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [hasMask, setHasMask] = useState(false);
  const editorRef = useRef<ImageEditorRef>(null);

  const styles: { id: StockStyle; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'standard', label: 'Standard', icon: <Camera className="w-4 h-4" />, desc: 'Clean, neutral professional look' },
    { id: 'vibrant_product', label: 'Product', icon: <Box className="w-4 h-4" />, desc: 'High contrast & saturation' },
    { id: 'soft_portrait', label: 'Portrait', icon: <User className="w-4 h-4" />, desc: 'Soft lighting, bokeh' },
    { id: 'architectural', label: 'Architecture', icon: <Building className="w-4 h-4" />, desc: 'Linear, clean lines' },
    { id: 'cinematic', label: 'Cinematic', icon: <Film className="w-4 h-4" />, desc: 'Dramatic color grading' },
  ];

  const handleImageSelect = useCallback((base64: string, mimeType: string) => {
    setOriginalImage({ data: base64, mimeType });
    setStatus(AppStatus.READY_TO_EDIT);
    setPrompt("");
    setGeneratedImage(null);
    setErrorMsg(null);
    setIsEraserActive(false);
    setHasMask(false);
    setSelectedStyle('standard');
  }, []);

  const handleGenerate = async () => {
    if (!originalImage) return;

    setStatus(AppStatus.GENERATING);
    setErrorMsg(null);

    try {
      // Get mask if present
      let maskBase64 = null;
      if (hasMask && editorRef.current) {
        maskBase64 = editorRef.current.getMaskedImage();
      }

      const resultBase64 = await generateEditedImage(
        originalImage.data,
        originalImage.mimeType,
        prompt,
        selectedStyle,
        maskBase64
      );
      setGeneratedImage(resultBase64);
      setStatus(AppStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Something went wrong while generating the image. Please try again.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setOriginalImage(null);
    setGeneratedImage(null);
    setPrompt('');
    setErrorMsg(null);
    setHasMask(false);
    setIsEraserActive(false);
  };

  const handleBackToEdit = () => {
    setStatus(AppStatus.READY_TO_EDIT);
    setGeneratedImage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* State: Upload */}
        {status === AppStatus.IDLE && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
                Turn your snapshots into <span className="text-indigo-600">Stock Photos</span>
              </h2>
              <p className="text-lg text-slate-600">
                Upload your raw product or lifestyle photos. Our AI cleans them up, fixes the lighting, and transforms them into commercial-grade assets instantly.
              </p>
            </div>
            <ImageUploader onImageSelect={handleImageSelect} />
          </div>
        )}

        {/* State: Editor */}
        {(status === AppStatus.READY_TO_EDIT || status === AppStatus.GENERATING || status === AppStatus.ERROR) && originalImage && !generatedImage && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in h-[calc(100vh-160px)] min-h-[600px]">
            {/* Left Column: Image Editor */}
            <div className="lg:col-span-8 flex flex-col h-full">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative flex-grow flex flex-col">
                 <div className="absolute top-4 left-4 z-20">
                   <button 
                    onClick={handleReset}
                    className="bg-white/90 backdrop-blur text-slate-700 p-2 rounded-full shadow-lg hover:text-red-600 transition-colors"
                    title="Remove image"
                   >
                     <X className="w-5 h-5" />
                   </button>
                 </div>

                 {/* Tools Toolbar Overlay */}
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur shadow-md rounded-full px-2 py-1.5 flex items-center gap-1 border border-slate-200">
                    <button 
                      onClick={() => setIsEraserActive(false)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!isEraserActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      View
                    </button>
                    <button 
                      onClick={() => setIsEraserActive(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isEraserActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      <Eraser className="w-4 h-4" />
                      Magic Eraser
                    </button>
                 </div>
                 
                 <div className="flex-grow bg-slate-100 relative p-4">
                   <ImageEditor 
                      ref={editorRef}
                      imageSrc={`data:${originalImage.mimeType};base64,${originalImage.data}`}
                      isEraserActive={isEraserActive}
                      onMaskChange={setHasMask}
                   />
                 </div>
              </div>
            </div>

            {/* Right Column: Controls */}
            <div className="lg:col-span-4 flex flex-col h-full overflow-y-auto">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                
                {/* 1. Style Selection */}
                <div>
                   <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
                     Choose Style
                   </h3>
                   <div className="grid grid-cols-2 gap-2">
                     {styles.map((style) => (
                       <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          selectedStyle === style.id 
                            ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                            : 'border-slate-200 hover:border-indigo-300'
                        }`}
                       >
                         <div className={`${selectedStyle === style.id ? 'text-indigo-600' : 'text-slate-500'} mb-1`}>
                           {style.icon}
                         </div>
                         <div className="text-sm font-semibold text-slate-900">{style.label}</div>
                         <div className="text-xs text-slate-500 truncate">{style.desc}</div>
                       </button>
                     ))}
                   </div>
                </div>

                {/* 2. Custom Prompt */}
                <div>
                    <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
                      Custom Instructions <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={status === AppStatus.GENERATING}
                      placeholder="E.g., Make the background blurred, add warm sunlight..."
                      className="w-full h-24 px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400 resize-none text-sm"
                    />
                </div>

                {/* 3. Action */}
                <div className="pt-4 border-t border-slate-100 mt-auto">
                   {hasMask && (
                     <div className="mb-4 text-xs text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg flex items-center">
                        <Eraser className="w-3 h-3 mr-2" />
                        Object removal active (red mask)
                     </div>
                   )}

                   {status === AppStatus.ERROR && (
                      <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                        {errorMsg}
                      </div>
                   )}
                   
                   <Button 
                    className="w-full py-4 text-lg shadow-lg shadow-indigo-200 rounded-xl"
                    onClick={handleGenerate}
                    isLoading={status === AppStatus.GENERATING}
                   >
                     <Wand2 className="w-5 h-5 mr-2" />
                     {status === AppStatus.GENERATING ? 'Processing...' : 'Generate Image'}
                   </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State: Result */}
        {status === AppStatus.COMPLETE && originalImage && generatedImage && (
          <GeneratedResult 
            originalImage={originalImage.data}
            generatedImage={generatedImage}
            onReset={handleBackToEdit}
            onRegenerate={handleGenerate}
          />
        )}
      </main>
    </div>
  );
};

export default App;
