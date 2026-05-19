import React from "react";
import { PDFViewerPanel } from "./components/PDFViewerPanel";
import { DynamicFormPanel } from "./components/DynamicFormPanel";
import { UploadOverlay } from "./components/UploadOverlay";
import { useFormStore } from "./store/useFormStore";

function App() {
  const pdfFile = useFormStore((state) => state.pdfFile);
  const isExtracting = useFormStore((state) => state.isExtracting);

  return (
    <div className="relative flex flex-col md:flex-row h-screen w-full bg-background text-foreground overflow-hidden">
      {(!pdfFile || isExtracting) && <UploadOverlay />}
      
      {/* Left Panel: PDF Viewer */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-border relative">
        {pdfFile && <PDFViewerPanel />}
      </div>
      
      {/* Right Panel: Dynamic Form */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full bg-card">
        {pdfFile && <DynamicFormPanel />}
      </div>
    </div>
  );
}

export default App;

