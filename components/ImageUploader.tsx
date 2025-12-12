import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, FileWarning } from 'lucide-react';
import Button from './Button';

interface ImageUploaderProps {
  onImageSelect: (base64: string, mimeType: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
       setError('File size too large. Please upload an image under 10MB.');
       return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 data and mime type
      const match = result.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        onImageSelect(match[2], match[1]);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ease-in-out ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
            : 'border-slate-300 bg-white hover:border-slate-400'
        } ${error ? 'border-red-300 bg-red-50' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${error ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {error ? <FileWarning className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-1">
              {error ? 'Upload failed' : 'Upload your image'}
            </h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              {error 
                ? error 
                : 'Drag and drop your photo here, or click to browse. We support JPG, PNG, and WebP.'}
            </p>
            
            {!error && (
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                <ImageIcon className="w-4 h-4 mr-2" />
                Select from computer
              </Button>
            )}
            
            {error && (
               <Button onClick={() => fileInputRef.current?.click()} variant="danger">
                 Try Again
               </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">1</div>
          <h4 className="font-medium text-slate-900">Upload Photo</h4>
          <p className="text-sm text-slate-500 mt-1">Start with any raw image from your phone or camera.</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
           <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">2</div>
          <h4 className="font-medium text-slate-900">Customize</h4>
          <p className="text-sm text-slate-500 mt-1">Tell AI to enhance quality or remove unwanted objects.</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
           <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">3</div>
          <h4 className="font-medium text-slate-900">Get Stock Quality</h4>
          <p className="text-sm text-slate-500 mt-1">Download high-res, professional grade assets.</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
