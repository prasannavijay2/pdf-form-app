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
      <Card className="h-full border-none shadow-none rounded-none flex items-center justify-center">
        <p className="text-muted-foreground">No form fields detected.</p>
      </Card>
    );
  }

  return (
    <Card className="h-full border-none shadow-none rounded-none overflow-y-auto">
      <CardHeader>
        <CardTitle>Extracted Form Data</CardTitle>
        <CardDescription>
          Review and edit the data extracted by AI. Selecting a field highlights it on the PDF.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {schemaFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className={errors[field.id] ? "text-destructive" : ""}>
                {field.label}
              </Label>
              
              {field.type === "text" || field.type === "number" ? (
                <Input
                  id={field.id}
                  type="text"
                  {...register(field.id)}
                  onFocus={() => handleFocus(field.id)}
                  onBlur={handleBlur}
                  className={errors[field.id] ? "border-destructive focus-visible:ring-destructive" : ""}
                />
              ) : field.type === "select" ? (
                <Controller
                  control={control}
                  name={field.id}
                  render={({ field: { onChange, value } }) => (
                    <div onFocus={() => handleFocus(field.id)} onBlur={handleBlur} tabIndex={-1}>
                      <Select onValueChange={onChange} defaultValue={value}>
                        <SelectTrigger className={errors[field.id] ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options && field.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              ) : field.type === "checkbox" ? (
                <div className="flex items-center space-x-2 pt-2">
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
                      />
                    )}
                  />
                  <Label htmlFor={field.id} className="text-sm font-normal cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              ) : null}

              {errors[field.id] && (
                <p className="text-sm text-destructive">{errors[field.id].message}</p>
              )}
            </div>
          ))}

          <Button type="submit" className="w-full mt-8">
            Submit Form
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

