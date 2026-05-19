import { create } from "zustand";

export const useFormStore = create((set) => ({
  focusedFieldId: null,
  schema: [],
  pdfFile: null,
  pdfUrl: null,
  isExtracting: false,
  
  setFocusedFieldId: (id) => set({ focusedFieldId: id }),
  setSchema: (schema) => set({ schema }),
  setPdfFile: (file) => {
    // Revoke previous URL to avoid memory leaks
    set((state) => {
      if (state.pdfUrl) {
        URL.revokeObjectURL(state.pdfUrl);
      }
      return { 
        pdfFile: file, 
        pdfUrl: file ? URL.createObjectURL(file) : null 
      };
    });
  },
  setIsExtracting: (isExtracting) => set({ isExtracting }),
}));
