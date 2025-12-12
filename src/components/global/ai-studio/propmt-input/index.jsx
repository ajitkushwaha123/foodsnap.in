"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function PromptBuilder({ value = "", onChange }) {
  const [items, setItems] = useState([""]);
  const [finalPrompt, setFinalPrompt] = useState(value);
  const [manualEdit, setManualEdit] = useState(false);

  // Generate final prompt text
  const generatePrompt = () => {
    const itemList = items.filter((i) => i.trim()).join(", ");

    // if (!itemList) return "";

    return `
Create a highly realistic, professional studio photoshoot-style combo image featuring ${itemList}. 
Arrange all items together in a cohesive composition with natural shadows, soft diffused lighting, 
and a premium background. Ensure every item appears sharp, detailed, and visually stunning.
 `.trim();
  };

  // Auto-generate only when user isn't manually editing
  useEffect(() => {
    if (!manualEdit) {
      const p = generatePrompt();
      setFinalPrompt(p);
      onChange?.(p);
    }
  }, [items]);

  // Allow manual editing of final prompt
  const handlePromptEdit = (v) => {
    setManualEdit(true);
    setFinalPrompt(v);
    onChange?.(v);
  };

  // Add new item input
  const addItem = () => {
    setItems([...items, ""]);
    setManualEdit(false);
  };

  // Update item
  const updateItem = (index, v) => {
    const updated = [...items];
    updated[index] = v;
    setItems(updated);
    setManualEdit(false);
  };

  // Delete item
  const deleteItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated.length ? updated : [""]);
    setManualEdit(false);
  };

  return (
    <div className="space-y-6 w-full">
      {/* ITEM FIELDS */}
      <div className="space-y-3">
        <Label className="font-medium">Items in Combo</Label>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder={`Item ${i + 1}`}
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                className="bg-muted/50"
              />

              {/* Delete button */}
              {items.length > 1 && (
                <Button
                  variant="ghost"
                  onClick={() => deleteItem(i)}
                  className="p-2"
                >
                  <X className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addItem} className="w-full">
          + Add Item
        </Button>
      </div>

      {/* PROMPT EDITOR */}
      <div className="space-y-2">
        <Label className="font-medium flex justify-between items-center">
          Prompt (Editable)
          {manualEdit && (
            <span className="text-xs text-blue-600">
              You are editing manually
            </span>
          )}
        </Label>

        <Textarea
          value={finalPrompt}
          onChange={(e) => handlePromptEdit(e.target.value)}
          placeholder="Write or edit your prompt here..."
          className="min-h-[150px] bg-muted/40"
        />
      </div>

      {/* Reset to auto generated */}
      {manualEdit && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            const p = generatePrompt();
            setFinalPrompt(p);
            onChange?.(p);
            setManualEdit(false);
          }}
        >
          Reset to Auto-Generated Prompt
        </Button>
      )}
    </div>
  );
}
