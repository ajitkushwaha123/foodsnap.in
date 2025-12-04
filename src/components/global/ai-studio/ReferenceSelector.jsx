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
  const refInput = useRef();

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
      
      <div className="grid grid-cols-2 gap-2">
        {presets.length === 0 && (
          <p className="text-xs text-gray-500 col-span-2">
            {category ? "No presets available" : "Select a category first"}
          </p>
        )}

        {presets.map((preset, index) => (
          <div
            key={index}
            onClick={() => onSelectPreset(preset)}
            className="cursor-pointer border rounded overflow-hidden hover:opacity-80 transition"
          >
            <img src={preset.url} className="h-20 w-full object-cover" />
          </div>
        ))}
      </div>

      {!reference ? (
        <div
          onClick={() => refInput.current?.click()}
          className="border-2 border-dashed rounded-xl h-32 flex items-center 
                     justify-center cursor-pointer hover:bg-gray-50"
        >
          <Upload className="w-8 h-8 text-gray-400" />
          <input
            ref={refInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onUpload(e.target.files)}
          />
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border">
          <img src={reference.url} className="h-32 w-full object-cover" />

          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
