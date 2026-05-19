import React, { useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFormStore } from "../store/useFormStore";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

export function DynamicFormPanel() {
  const setFocusedFieldId = useFormStore((state) => state.setFocusedFieldId);
  const schemaFields = useFormStore((state) => state.schema);

  const { dynamicSchema, defaultValues } = useMemo(() => {
    const schemaObj = {};
    const defaultVals = {};
    
    if (schemaFields && Array.isArray(schemaFields)) {
      schemaFields.forEach((field) => {
        // Explicitly handle boolean default for checkbox to prevent uncontrolled-to-controlled warning
        if (field.type === "checkbox") {
          defaultVals[field.id] = field.value === true || field.value === "true";
        } else {
          defaultVals[field.id] = field.value || "";
        }
        
        if (field.type === "text" || field.type === "select") {
          schemaObj[field.id] = z.string().optional().or(z.literal(""));
        } else if (field.type === "number") {
          schemaObj[field.id] = z.string().regex(/^\d*$/, "Must be a valid number").optional().or(z.literal(""));
        } else if (field.type === "checkbox") {
          schemaObj[field.id] = z.boolean().optional();
        } else {
           // fallback
           schemaObj[field.id] = z.any().optional();
        }
      });
    }
    
    return { 
      dynamicSchema: z.object(schemaObj),
      defaultValues: defaultVals
    };
  }, [schemaFields]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues,
  });

  // Reset form when schema changes
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert("Form submitted successfully!");
  };

  const handleFocus = (id) => {
    setFocusedFieldId(id);
  };

  const handleBlur = () => {
    setFocusedFieldId(null);
  };

  if (!schemaFields || schemaFields.length === 0) {
    return (
      <div className="h-full bg-slate-900/50 backdrop-blur-xl border-l border-slate-800 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <p className="text-slate-400 font-light text-lg">Awaiting document digitization...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="h-full bg-[#0d1326] overflow-y-auto border-l border-slate-800/60 custom-scrollbar">
      <div className="p-8 sticky top-0 z-10 bg-[#0d1326]/90 backdrop-blur-xl border-b border-slate-800/60 shadow-sm">
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Extracted Data
        </h2>
        <p className="text-sm text-slate-400 font-light leading-relaxed">
          Review the AI-extracted fields below. Selecting a field dynamically highlights its bounding box on the original document.
        </p>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show"
            className="space-y-6"
          >
            {schemaFields.map((field) => (
              <motion.div key={field.id} variants={itemVariants} className="space-y-2 group">
                <Label 
                  htmlFor={field.id} 
                  className={`text-sm font-medium transition-colors ${errors[field.id] ? "text-red-400" : "text-slate-300 group-hover:text-blue-400"}`}
                >
                  {field.label}
                </Label>
                
                {field.type === "text" || field.type === "number" ? (
                  <Input
                    id={field.id}
                    type="text"
                    {...register(field.id)}
                    onFocus={() => handleFocus(field.id)}
                    onBlur={handleBlur}
                    className={`bg-slate-900/50 border-slate-800 text-slate-100 shadow-sm transition-all duration-300 focus:bg-slate-900 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] focus:border-blue-500/50 ${errors[field.id] ? "border-red-500/50 focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]" : ""}`}
                  />
                ) : field.type === "select" ? (
                  <Controller
                    control={control}
                    name={field.id}
                    render={({ field: { onChange, value } }) => (
                      <div onFocus={() => handleFocus(field.id)} onBlur={handleBlur} tabIndex={-1}>
                        <Select onValueChange={onChange} defaultValue={value}>
                          <SelectTrigger className={`bg-slate-900/50 border-slate-800 text-slate-100 focus:ring-blue-500/50 transition-all ${errors[field.id] ? "border-red-500/50" : ""}`}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                            {field.options && field.options.map((opt) => (
                              <SelectItem key={opt} value={opt} className="focus:bg-blue-600 focus:text-white">
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                ) : field.type === "checkbox" ? (
                  <div className="flex items-center space-x-3 pt-2 p-3 rounded-lg border border-slate-800 bg-slate-900/30 transition-colors hover:bg-slate-900/60 hover:border-slate-700">
                    <Controller
                      control={control}
                      name={field.id}
                      render={({ field: { onChange, value } }) => (
                        <Checkbox
                          id={field.id}
                          checked={!!value}
                          onCheckedChange={onChange}
                          onFocus={() => handleFocus(field.id)}
                          onBlur={handleBlur}
                          className="border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                      )}
                    />
                    <Label htmlFor={field.id} className="text-sm font-normal text-slate-300 cursor-pointer">
                      {field.label}
                    </Label>
                  </div>
                ) : null}

                {errors[field.id] && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-sm text-red-400 font-medium">
                    {errors[field.id].message}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-6"
          >
            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 border border-blue-500/50"
            >
              Confirm & Save Data
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

