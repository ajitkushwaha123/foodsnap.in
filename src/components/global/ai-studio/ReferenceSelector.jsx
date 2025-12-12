"use client";

import { Upload, X } from "lucide-react";
import React, { useRef } from "react";
import ReferenceDropdown from "./ReferenceDropdown";
import { referenceCategories } from "../../../../utils/presets";

export default function ReferenceSelector({
  category = "",
  presets = [],
  reference = null,
  onSelectCategory = () => {},
  onSelectPreset = () => {},
  onUpload = () => {},
  onRemove = () => {},
}) {
  const refInput = useRef(null);

  const selectPresetAsBlob = async (preset) => {
    if (!preset?.url) return;

    const res = await fetch(preset.url);
    const blob = await res.blob();

    const file = new File([blob], "preset.jpg", { type: blob.type });

    const blobUrl = URL.createObjectURL(file);

    const referenceObj = {
      url: blobUrl,
      file,
      uploaded: false,
    };

    // ⭐ Send reference + items + replaceItems together
    onSelectPreset({
      reference: referenceObj,
      items: preset.items || [],
      replaceItems: preset.replaceItems || [],
    });
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Preset Reference Images</p>

      <ReferenceDropdown
        options={referenceCategories}
        value={category}
        onChange={onSelectCategory}
        placeholder="Select category"
        className="w-full"
      />

      <div className="grid grid-cols-4 gap-2">
        {presets.length === 0 && (
          <p className="text-xs text-gray-500 col-span-2">
            {category ? "No presets available" : "Select a category first"}
          </p>
        )}

        {presets.map((preset, index) => (
          <div
            key={index}
            onClick={() => selectPresetAsBlob(preset)}
            className="cursor-pointer border rounded overflow-hidden hover:opacity-80 transition"
          >
            <img
              src={preset?.url || "/placeholder.png"}
              alt=""
              className="aspects-[3/2] object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
