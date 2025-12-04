"use client";

import React, { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";
import ReferenceSelector from "./ReferenceSelector";
import ReferenceItemsEditor from "./ReferenceItemsEditor";
import { referencePresets } from "../../../../utils/presets";

export default function Reference({ value, onChange }) {
  const [reference, setReference] = useState(value?.reference || null);
  const [category, setCategory] = useState(value?.category || "");
  const [presets, setPresets] = useState(value?.presets || []);
  const [items, setItems] = useState(value?.items || []);
  const [replaceItems, setReplaceItems] = useState(value?.replaceItems || []);

  // Helper to update parent with current state
  const updateParent = (newState = {}) => {
    const state = {
      reference,
      category,
      presets,
      items,
      replaceItems,
      ...newState,
    };
    onChange?.(state);
  };

  // Upload new reference image
  const handleUpload = (files) => {
    const file = files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const newReference = { url, file, uploaded: true };
    setReference(newReference);
    setItems([]); // clear items on new upload
    updateParent({ reference: newReference, items: [] });
  };

  // Remove reference image
  const handleRemove = () => {
    setReference(null);
    setItems([]);
    updateParent({ reference: null, items: [] });
  };

  // Select preset image
  const handleSelectPreset = (preset) => {
    setReference(preset);
    setItems(preset.items || []);
    updateParent({ reference: preset, items: preset.items || [] });
  };

  // Change category and load presets
  const handleSelectCategory = (cat) => {
    setCategory(cat);
    const newPresets = referencePresets[cat] || [];
    setPresets(newPresets);
    updateParent({ category: cat, presets: newPresets });
  };

  // Reference Items Editor handlers
  const updateItem = (idx, value) => {
    const newItems = [...items];
    newItems[idx] = value;
    setItems(newItems);
    updateParent({ items: newItems });
  };

  const deleteItem = (idx) => {
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
    updateParent({ items: newItems });
  };

  const addItem = () => {
    const newItems = [...items, ""];
    const newReplace = [...replaceItems, ""];
    setItems(newItems);
    setReplaceItems(newReplace);
    updateParent({ items: newItems, replaceItems: newReplace });
  };

  const updateReplacement = (idx, value) => {
    const newReplace = [...replaceItems];
    newReplace[idx] = value;
    setReplaceItems(newReplace);
    updateParent({ replaceItems: newReplace });
  };

  const deleteReplacement = (idx) => {
    const newReplace = [...replaceItems];
    newReplace[idx] = "";
    setReplaceItems(newReplace);
    updateParent({ replaceItems: newReplace });
  };

  return (
    <div className="space-y-6">
      {/* Upload / Display Reference Image */}
      <ImageUploader
        images={reference ? [reference] : []}
        onChange={handleUpload}
        maxImages={1}
        label="Reference Image"
      />

      {/* Category & Preset Selector */}
      <ReferenceSelector
        category={category}
        presets={presets}
        reference={reference}
        onSelectCategory={handleSelectCategory}
        onSelectPreset={handleSelectPreset}
        onUpload={handleUpload}
        onRemove={handleRemove}
      />

      {/* Reference Items Editor */}
      {items.length > 0 && (
        <ReferenceItemsEditor
          items={items}
          replaceItems={replaceItems}
          addItem={addItem}
          updateItem={updateItem}
          deleteItem={deleteItem}
          updateReplacement={updateReplacement}
          deleteReplacement={deleteReplacement}
        />
      )}
    </div>
  );
}
