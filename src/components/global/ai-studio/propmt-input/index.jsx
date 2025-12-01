"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function PromptBuilder({ value, onChange }) {
  const [items, setItems] = useState([""]);
  const [finalPrompt, setFinalPrompt] = useState("");

  // Generate final prompt text
  const generatePrompt = () => {
    const itemList = items.filter(Boolean).join(", ");

    return `Create a highly realistic, professional studio photoshoot-style combo image featuring ${itemList}. Arrange all items together in a cohesive composition with natural shadows, soft diffused lighting, and a premium background. Make sure every item appears sharp, detailed, and visually stunning.`;
  };

  // Whenever items change → generate prompt → return to parent
  useEffect(() => {
    const p = generatePrompt();
    setFinalPrompt(p);
    onChange && onChange(p);
  }, [items]);

  // Add item field
  const addItem = () => {
    setItems([...items, ""]);
  };

  // Update individual item
  const updateItem = (index, v) => {
    const copy = [...items];
    copy[index] = v;
    setItems(copy);
  };

  return (
    <div className="space-y-5 w-full">
      {/* ITEM INPUTS */}
      <div className="space-y-3">
        <Label className="font-medium">Items in Combo</Label>

        {items.map((item, i) => (
          <Input
            key={i}
            placeholder={`Item ${i + 1}`}
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            className="bg-muted/50"
          />
        ))}

        <Button variant="outline" onClick={addItem} className="w-full">
          + Add Item
        </Button>
      </div>

      {/* PREVIEW AREA */}
      <div className="space-y-2">
        <Label className="font-medium">Prompt Preview</Label>

        <Textarea
          value={finalPrompt}
          onChange={() => {}}
          readOnly
          placeholder="Create a highly realistic, professional studio photoshoot-style combo image featuring bottle, cap, sunscreen. Arrange all items together..."
          className="min-h-[130px] bg-muted/40"
        />
      </div>
    </div>
  );
}
