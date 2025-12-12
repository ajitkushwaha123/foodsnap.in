import React, { useState } from "react";
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

  // -------------------------------
  // Handle Upload (File Upload)
  // -------------------------------
  const handleUpload = (files) => {
    if (!files || files.length === 0) return;

    let file = files[0];

    if (file?.file instanceof File) {
      file = file.file;
    }

    if (!(file instanceof File)) {
      console.warn("Uploaded item is not a File:", file);
      return;
    }

    const url = URL.createObjectURL(file);
    const newReference = { url, file, uploaded: true };

    setReference(newReference);
    setItems([]);

    updateParent({ reference: newReference, items: [] });
  };

  // -------------------------------
  // Remove reference image
  // -------------------------------
  const handleRemove = () => {
    setReference(null);
    setItems([]);
    setReplaceItems([]);
    updateParent({ reference: null, items: [], replaceItems: [] });
  };

  // -------------------------------
  // Handle PRESET selection (FIXED)
  // -------------------------------
  const handleSelectPreset = ({ reference, items, replaceItems }) => {
    setReference(reference);
    setItems(items || []);
    setReplaceItems(replaceItems || []);

    updateParent({
      reference,
      items: items || [],
      replaceItems: replaceItems || [],
    });
  };

  // -------------------------------
  // Handle Category change
  // -------------------------------
  const handleSelectCategory = (cat) => {
    const newPresets = referencePresets[cat] || [];

    setCategory(cat);
    setPresets(newPresets);

    updateParent({ category: cat, presets: newPresets });
  };

  // -------------------------------
  // Item Editing
  // -------------------------------
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
      <ImageUploader
        images={reference ? [reference] : []}
        onChange={handleUpload}
        maxImages={1}
        label="Reference Image"
        onRemove={handleRemove}
      />

      <ReferenceSelector
        category={category}
        presets={presets}
        reference={reference}
        onSelectCategory={handleSelectCategory}
        onSelectPreset={handleSelectPreset} // <-- FIXED
        onUpload={handleUpload}
        onRemove={handleRemove}
      />

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
