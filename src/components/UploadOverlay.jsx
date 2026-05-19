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
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Analyzing Document...</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Our AI is scanning the PDF to identify form fields, checkboxes, and their exact positions.
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background p-6">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Upload PDF Form
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload any PDF document. Our AI will automatically extract all input fields and generate an interactive form.
          </p>
        </div>

        <div
          className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out ${dragActive
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-accent/50"
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="application/pdf"
            onChange={handleChange}
          />
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <UploadCloud className="w-12 h-12 text-primary" />
            </div>
            <div>
              <p className="text-xl font-medium text-foreground">
                Drag & drop your PDF here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse from your computer
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-start space-x-3 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
