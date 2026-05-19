import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useFormStore } from "../store/useFormStore";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PDFViewerPanel() {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);
  const [pageSize, setPageSize] = useState(null);
  
  const focusedFieldId = useFormStore((state) => state.focusedFieldId);
  const schema = useFormStore((state) => state.schema);
  const pdfUrl = useFormStore((state) => state.pdfUrl);

  const focusedField = schema ? schema.find((f) => f.id === focusedFieldId) : null;

  // Resize observer to make container responsive
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const onPageLoadSuccess = (page) => {
    setPageSize({
      width: page.originalWidth,
      height: page.originalHeight,
    });
  };

  const renderWidth = containerWidth ? Math.min(containerWidth - 32, 800) : 600;
  
  // Calculate dynamic dimensions and vertical scale factor
  const actualRatio = pageSize ? pageSize.height / pageSize.width : 1.4142;
  const renderHeight = renderWidth * actualRatio;
  
  // Hand-crafted coordinates are designed for standard A4 aspect ratio (1.4142)
  const targetRatio = 1.4142;
  const yScale = targetRatio / actualRatio;

  return (
    <div className="w-full h-full bg-[#0a0f1c] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(29,78,216,0.1),rgba(255,255,255,0))] flex items-center justify-center overflow-auto p-8 relative" ref={containerRef}>
      {pdfUrl ? (
        <div 
          className="shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-md relative bg-white overflow-hidden ring-1 ring-slate-800"
          style={{ width: renderWidth, height: renderHeight }}
        >
          <Document
            file={pdfUrl}
            className="w-full h-full"
          >
            <Page 
              pageNumber={1} 
              width={renderWidth} 
              onLoadSuccess={onPageLoadSuccess}
              renderTextLayer={false} 
              renderAnnotationLayer={false}
            />
          </Document>
          
          {/* Glowing target border around the focused field only, scaled perfectly using yScale */}
          {focusedField && (
            <motion.div
              key={`focus-${focusedField.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{
                position: "absolute",
                left: `${parseFloat(focusedField.x || 0)}%`,
                top: `${parseFloat(focusedField.y || 0) * yScale}%`,
                width: `${parseFloat(focusedField.width || 0)}%`,
                height: `${parseFloat(focusedField.height || 0) * yScale}%`,
                border: "2.5px solid rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.6), inset 0 0 8px rgba(59, 130, 246, 0.3)",
                zIndex: 10,
                pointerEvents: "none",
                borderRadius: "4px",
              }}
            />
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-500 absolute top-0 left-0">
          No PDF Loaded
        </div>
      )}
    </div>
  );
}


