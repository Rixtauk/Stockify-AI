import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Stockify AI
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Beta</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">How it works</a>
            <a href="#" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Gallery</a>
            <div className="flex items-center gap-1 text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              <Sparkles className="w-3 h-3" />
              <span>Powered by Gemini 2.5</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
