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
    <div className="w-full h-full bg-slate-100 flex justify-center overflow-auto p-4 relative" ref={containerRef}>
      {pdfUrl ? (
        <div 
          className="shadow-xl rounded-md relative bg-white overflow-hidden"
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                left: `${parseFloat(focusedField.x || 0)}%`,
                top: `${parseFloat(focusedField.y || 0) * yScale}%`,
                width: `${parseFloat(focusedField.width || 0)}%`,
                height: `${parseFloat(focusedField.height || 0) * yScale}%`,
                border: "2px solid rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.12)",
                boxShadow: "0 0 8px rgba(59, 130, 246, 0.4)",
                zIndex: 10,
                pointerEvents: "none",
                borderRadius: "3px",
              }}
            />
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground absolute top-0 left-0 rounded-md bg-white">
          No PDF Loaded
        </div>
      )}
    </div>
  );
}


