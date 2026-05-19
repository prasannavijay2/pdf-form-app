import React, { useCallback, useState } from "react";
import { UploadCloud, File, AlertCircle, Loader2 } from "lucide-react";
import { useFormStore } from "../store/useFormStore";
import { mockSchema } from "../data/schema";

export function UploadOverlay() {
  const setPdfFile = useFormStore((state) => state.setPdfFile);
  const setIsExtracting = useFormStore((state) => state.setIsExtracting);
  const setSchema = useFormStore((state) => state.setSchema);
  const isExtracting = useFormStore((state) => state.isExtracting);

  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file) => {
    if (file && file.type === "application/pdf") {
      setError(null);
      setPdfFile(file);
      setIsExtracting(true);

      const formData = new FormData();
      formData.append("pdf", file);

      try {
        const apiUrl = import.meta.env.DEV ? "http://localhost:3001/api/extract-pdf" : "/api/extract-pdf";
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to extract PDF data");
        }

        const data = await response.json();
        
        // Merge extracted values with mockSchema
        const mergedSchema = mockSchema.map(field => ({
          ...field,
          value: data[field.id] !== undefined ? data[field.id] : (field.type === "checkbox" ? false : "")
        }));
        
        setSchema(mergedSchema);
      } catch (err) {
        console.error("Extraction error:", err);
        setError("Error extracting form fields. Please ensure the backend server is running.");
        setPdfFile(null); // Reset on error
      } finally {
        setIsExtracting(false);
      }
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  if (isExtracting) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
      >
        <motion.div 
          animate={{ scale: [0.95, 1.05, 0.95] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex items-center justify-center mb-8"
        >
          <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full" />
          <Loader2 className="w-20 h-20 text-blue-400 animate-spin relative z-10" />
        </motion.div>
        
        <motion.h2 
          initial={{ y: 10, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-3 tracking-tight"
        >
          Analyzing Document...
        </motion.h2>
        
        <motion.p 
          initial={{ y: 10, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.4 }}
          className="text-blue-200/70 text-center max-w-md text-lg"
        >
          Our neural engine is scanning the PDF layout to extract interactive form fields with pixel-perfect precision.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f1c] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(29,78,216,0.15),rgba(255,255,255,0))] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 mb-6 drop-shadow-sm">
            Intelligent PDF Extraction
          </h1>
          <p className="text-xl text-slate-400 font-light leading-relaxed max-w-xl mx-auto">
            Drop your bank form below. Our AI vision model will instantly digitize it into an interactive schema.
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`relative flex flex-col items-center justify-center p-16 rounded-2xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden ${
            dragActive
              ? "border-blue-500 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.3)]"
              : "border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
          } border border-dashed`}
          style={{ backdropFilter: "blur(12px)" }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Animated background glow for drag active state */}
          {dragActive && (
             <motion.div 
               layoutId="glow"
               className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-2xl" 
             />
          )}

          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            accept="application/pdf"
            onChange={handleChange}
          />
          
          <div className="flex flex-col items-center justify-center space-y-6 text-center relative z-10 pointer-events-none">
            <motion.div 
              animate={{ y: dragActive ? -5 : 0 }}
              className={`p-5 rounded-full transition-colors duration-300 ${dragActive ? 'bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-slate-800 shadow-inner'}`}
            >
              <UploadCloud className={`w-14 h-14 ${dragActive ? 'text-blue-400' : 'text-slate-400'}`} />
            </motion.div>
            
            <div className="space-y-2">
              <p className="text-2xl font-semibold text-slate-200">
                {dragActive ? "Drop to digitize..." : "Drag & drop your PDF here"}
              </p>
              <p className="text-base text-slate-500">
                or click anywhere to browse your files
              </p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex items-center space-x-3 p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 backdrop-blur-sm shadow-lg shadow-red-500/5"
          >
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
