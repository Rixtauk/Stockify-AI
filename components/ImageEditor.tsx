import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Eraser, Undo2 } from 'lucide-react';
import Button from './Button';

interface ImageEditorProps {
  imageSrc: string;
  isEraserActive: boolean;
  onMaskChange: (hasMask: boolean) => void;
}

export interface ImageEditorRef {
  getMaskedImage: () => string | null;
  clearMask: () => void;
}

const ImageEditor = forwardRef<ImageEditorRef, ImageEditorProps>(({ 
  imageSrc, 
  isEraserActive,
  onMaskChange 
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  
  // Initialize canvas when image loads
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setupCanvas();
    };
  }, [imageSrc]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setupCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imageRef.current;
    
    if (!canvas || !container || !img) return;

    // Calculate aspect ratio fitting
    const containerAspect = container.clientWidth / container.clientHeight;
    const imgAspect = img.naturalWidth / img.naturalHeight;

    let renderWidth, renderHeight;

    if (containerAspect > imgAspect) {
      renderHeight = container.clientHeight;
      renderWidth = renderHeight * imgAspect;
    } else {
      renderWidth = container.clientWidth;
      renderHeight = renderWidth / imgAspect;
    }

    canvas.width = renderWidth;
    canvas.height = renderHeight;
    
    // We only redraw the image if there's no existing drawing state we want to preserve?
    // For simplicity, we just clear and let the user draw. 
    // In a production app, we'd scale the drawing context.
    // For now, simple resize clears mask (MVP).
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, renderWidth, renderHeight);
    }
    setHasDrawing(false);
    onMaskChange(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEraserActive) return;
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    const { x, y } = getCoordinates(e);
    
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 20; // Brush size
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isEraserActive) return;
    const ctx = canvasRef.current?.getContext('2d');
    const { x, y } = getCoordinates(e);
    
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      if (!hasDrawing) {
        setHasDrawing(true);
        onMaskChange(true);
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const ctx = canvasRef.current?.getContext('2d');
      ctx?.closePath();
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    setupCanvas(); // Resets everything
  };

  // Expose method to get the final composited image (Image + Red Strokes)
  useImperativeHandle(ref, () => ({
    getMaskedImage: () => {
      if (!hasDrawing || !canvasRef.current) return null;
      // Convert canvas to base64 (PNG to preserve quality)
      const dataUrl = canvasRef.current.toDataURL('image/png');
      return dataUrl.split(',')[1]; // Remove data:image/png;base64, prefix
    },
    clearMask: clearCanvas
  }));

  return (
    <div className="relative w-full h-full bg-slate-100 rounded-lg overflow-hidden group select-none" ref={containerRef}>
       <canvas
        ref={canvasRef}
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair touch-none ${!isEraserActive ? 'pointer-events-none' : ''}`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
       />
       
       {/* Instruction Overlay */}
       {isEraserActive && !hasDrawing && (
         <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-medium pointer-events-none animate-pulse">
           Paint over objects to remove
         </div>
       )}

       {/* Clear Button */}
       {hasDrawing && (
         <button 
           onClick={clearCanvas}
           className="absolute bottom-4 right-4 bg-white shadow-md p-2 rounded-full text-slate-700 hover:text-red-600 transition-colors z-10"
           title="Clear mask"
         >
           <Undo2 className="w-5 h-5" />
         </button>
       )}
    </div>
  );
});

export default ImageEditor;
