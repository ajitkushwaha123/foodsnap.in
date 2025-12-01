"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { setOpenStudio } from "@/store/slice/searchSlice";
import { useStudio } from "@/store/hooks/useStudio";
import PromptBuilder from "../propmt-input";

// ---- Preset reference images ----
const referencePresets = {
  thali: [
    "/assets/thali/thali1.png",
    "/assets/thali/thali2.png",
    "/assets/thali/thali3.png",
    "/assets/thali/thali4.png",
    "/assets/thali/thali5.png",
    "/assets/thali/thali6.png",
  ],
  bowl: ["/presets/bowl1.jpg", "/presets/bowl2.jpg", "/presets/bowl3.jpg"],
  plate: ["/presets/plate1.jpg", "/presets/plate2.jpg"],
  combo: ["/presets/combo1.jpg", "/presets/combo2.jpg"],
};

// Convert any URL to File binary
async function urlToFile(url) {
  const response = await fetch(url);
  const blob = await response.blob();

  const ext = url.split(".").pop().split("?")[0];

  return new File([blob], `preset_${Date.now()}.${ext}`, { type: blob.type });
}

const StudioSidebar = () => {
  const dispatch = useDispatch();
  const { loading, data, error, generateAI, reset } = useStudio();

  const [images, setImages] = useState([]);
  const [prompt, setPrompt] = useState("");

  // Each item: { file: File, url: localURL }
  const [refImages, setRefImages] = useState([]);

  const [dragMain, setDragMain] = useState(false);
  const [dragRef, setDragRef] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("thali");

  const inputRef = useRef(null);
  const refInputRef = useRef(null);
  const scrollResultRef = useRef(null);

  // MAIN FILES
  const handleMainFiles = (files) => {
    const allowed = Array.from(files).slice(0, 4 - images.length);

    const mapped = allowed.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...mapped].slice(0, 4));
  };

  const removeImage = (i) =>
    setImages((prev) => prev.filter((_, x) => x !== i));

  // REFERENCE FILES
  const handleReferenceFiles = (files) => {
    const allowed = Array.from(files).slice(0, 4 - refImages.length);

    const mapped = allowed.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setRefImages((prev) => [...prev, ...mapped].slice(0, 4));
  };

  const removeReferenceImage = (i) =>
    setRefImages((prev) => prev.filter((_, x) => x !== i));

  // PRESET → Convert URL to File
  const addPresetRef = async (url) => {
    if (refImages.length >= 4) return;

    const file = await urlToFile(url);

    setRefImages((prev) => [
      ...prev,
      {
        file,
        url, // this is fine for UI
      },
    ]);
  };

  /* ==========================
        AI PAYLOAD BUILDER
     ========================== */
  const handleAiGeneration = async () => {
    if (loading) return;
    if (!prompt.trim()) return alert("Enter a prompt!");
    if (images.length === 0) return alert("Upload at least one image!");

    const formData = new FormData();

    // MAIN IMAGES (BINARY)
    for (const img of images) {
      formData.append("images", img.file);
    }

    // REF IMAGES (ALL BINARY)
    for (const img of refImages) {
      if (img.file) {
        formData.append("reference", img.file);
      }
    }

    formData.append("prompt", prompt);
    formData.append("category", selectedCategory);

    generateAI(formData);
  };

  // Auto scroll to result
  useEffect(() => {
    if (data && scrollResultRef.current) {
      setTimeout(() => {
        scrollResultRef.current.scrollIntoView({ behavior: "smooth" });
      }, 250);
    }
  }, [data]);

  const closeStudio = () => {
    dispatch(setOpenStudio(false));
    reset();
  };

  return (
    <div className="w-96 h-screen bg-white border-l text-gray-900 flex flex-col shadow-xl">
      {/* HEADER */}
      <div className="p-5 border-b">
        <h2 className="text-xl font-semibold">AI Studio</h2>
        <p className="text-gray-500 text-sm mt-1">
          Upload images & Generate AI results
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* MAIN UPLOADER */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragEnter={() => setDragMain(true)}
          onDragLeave={() => setDragMain(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragMain(false);
            handleMainFiles(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-xl h-36 flex flex-col items-center justify-center cursor-pointer transition ${
            dragMain
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Upload className="w-10 h-10 text-gray-400" />
          <p className="text-gray-600 mt-2 text-sm">Upload Main Images</p>
          <p className="text-xs text-gray-400">(max 4)</p>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleMainFiles(e.target.files)}
          />
        </div>

        {/* MAIN PREVIEW */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative group rounded-lg overflow-hidden border"
              >
                <img src={img.url} className="w-full h-32 object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 bg-black bg-opacity-40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CATEGORY SELECTOR */}
        <div>
          <label className="text-sm font-medium">Reference Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border rounded-lg p-2 mt-1"
          >
            {Object.keys(referencePresets).map((cat) => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* PRESET IMAGES */}
        <div>
          <p className="text-sm mb-2 text-gray-500">
            Select Preset Reference Images
          </p>
          <div className="grid grid-cols-3 gap-2">
            {referencePresets[selectedCategory].map((url, i) => (
              <div
                key={i}
                onClick={() => addPresetRef(url)}
                className="cursor-pointer border rounded overflow-hidden hover:opacity-80"
              >
                <img src={url} className="h-24 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* REFERENCE UPLOADER */}
        <div
          onClick={() => refInputRef.current?.click()}
          onDragEnter={() => setDragRef(true)}
          onDragLeave={() => setDragRef(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragRef(false);
            handleReferenceFiles(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-xl h-36 flex flex-col items-center justify-center cursor-pointer transition ${
            dragRef
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Upload className="w-10 h-10 text-gray-400" />
          <p className="text-gray-600 mt-2 text-sm">Upload Reference Images</p>
          <p className="text-xs text-gray-400">(optional, max 4)</p>

          <input
            ref={refInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleReferenceFiles(e.target.files)}
          />
        </div>

        {/* REF PREVIEW */}
        {refImages.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {refImages.map((img, i) => (
              <div
                key={i}
                className="relative group rounded-lg overflow-hidden border"
              >
                <img src={img.url} className="w-full h-32 object-cover" />
                <button
                  onClick={() => removeReferenceImage(i)}
                  className="absolute top-2 right-2 bg-black bg-opacity-40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PROMPT */}
        <PromptBuilder value={prompt} onChange={(p) => setPrompt(p)} />

        {/* LOADER */}
        {loading && (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="animate-spin w-8 h-8 text-green-600" />
            <p className="text-gray-600 mt-3">Generating with AI...</p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {/* RESULTS */}
        {data && (
          <div ref={scrollResultRef} className="pt-4 border-t space-y-4">
            <h3 className="text-lg font-semibold">AI Results</h3>
            <div className="grid grid-cols-1 gap-4">
              {data?.images?.map((url, i) => (
                <img key={i} src={url} className="rounded-lg shadow-md" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t flex gap-3">
        <Button variant="outline" className="w-1/2 py-5" onClick={closeStudio}>
          Cancel
        </Button>

        <Button
          className="w-1/2 py-5 bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white flex items-center gap-2"
          disabled={loading || !prompt.trim() || images.length === 0}
          onClick={handleAiGeneration}
        >
          {loading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate
        </Button>
      </div>
    </div>
  );
};

export default StudioSidebar;
