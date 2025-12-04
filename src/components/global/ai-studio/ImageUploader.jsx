"use client";

import React, { useState } from "react";
import { Upload, X } from "lucide-react";

export default function ImageUploader({
  images = [],
  onChange,
  maxImages = 4,
  label = "Upload Images",
}) {
  const inputRef = React.useRef();
  const [error, setError] = useState("");

  const ALLOWED_FORMATS = ["image/jpeg", "image/jpg", "image/png"];

  const handleFiles = (files) => {
    setError("");

    if (images.length >= maxImages) {
      setError(`You can upload only ${maxImages} images.`);
      return;
    }

    let incoming = Array.from(files);

    const valid = [];

    for (const file of incoming) {
      if (!ALLOWED_FORMATS.includes(file.type)) {
        setError(
          `File "${file.name}" is not allowed. Only JPG, JPEG, PNG formats allowed.`
        );
        continue;
      }

      valid.push(file);
    }

    if (valid.length === 0) return;

    const allowedCount = maxImages - images.length;
    const sliced = valid.slice(0, allowedCount);

    if (valid.length > allowedCount) {
      setError(`You can upload only ${maxImages} images in total.`);
    }

    const mapped = sliced.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    onChange([...images, ...mapped]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">{label}</label>

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-xl h-40 flex flex-col
                   items-center justify-center cursor-pointer hover:bg-gray-50"
      >
        <Upload className="w-12 h-12 text-gray-400" />
        <p className="text-gray-500 text-sm mt-2">
          Click to upload or drag & drop (max {maxImages})
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm font-medium mt-1">{error}</p>
      )}

      {images?.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mt-3">
          {images.map((img, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden border">
              <img src={img.url} className="h-28 w-full object-cover" />

              <button
                onClick={() => {
                  const updated = images.filter((_, x) => x !== i);
                  onChange(updated);
                }}
                className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
