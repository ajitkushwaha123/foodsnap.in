"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Sparkles, X, Loader2, Trash, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { setOpenStudio } from "@/store/slice/searchSlice";
import { useStudio } from "@/store/hooks/useStudio";
import PromptBuilder from "../propmt-input";

/* ===========================
   Presets
   =========================== */
const referencePresets = {
  thali: [
    {
      url: "/assets/thali/thali1.png",
      items: ["Jeera Rice", "Dal", "Gulab Jamun"],
    },
    {
      url: "/assets/thali/thali2.png",
      items: [
        "Aloo Matar Sabji",
        "Shahi Paneer",
        "Plain Rice",
        "Dal",
        "Lassi",
        "Green Sauce",
        "Salad",
        "Lachha Paratha",
        "Paitha",
      ],
    },
    { url: "/assets/thali/thali3.png", items: ["rice", "curry", "salad"] },
  ],

  bowl: [
    { url: "/presets/bowl1.jpg", items: ["chole"] },
    { url: "/presets/bowl2.jpg", items: ["rajma"] },
  ],

  combo: [
    { url: "/presets/combo1.jpg", items: ["burger", "fries", "coke"] },
    { url: "/presets/combo2.jpg", items: ["idli", "sambar", "chutney"] },
  ],
};

async function urlToFile(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  const ext = url.split(".").pop()?.split("?")[0] || "jpg";
  return new File([blob], `preset_${Date.now()}.${ext}`, { type: blob.type });
}

/* ===========================
   Component
   =========================== */
const StudioSidebar = () => {
  const dispatch = useDispatch();
  const { loading, data, error, generateAI, reset } = useStudio();

  const [images, setImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("thali");

  const [reference, setReference] = useState(null);
  const [referenceItems, setReferenceItems] = useState([]);
  const [removedItems, setRemovedItems] = useState([]);
  const [replaceItems, setReplaceItems] = useState({});

  const [prompt, setPrompt] = useState("");
  const inputRef = useRef(null);
  const refInputRef = useRef(null);
  const scrollResultRef = useRef(null);

  /* ===========================
     Main Image Upload
     =========================== */
  const handleMainFiles = (files) => {
    const allowed = Array.from(files).slice(0, 4 - images.length);
    const mapped = allowed.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...mapped]);
  };

  const removeImage = (i) =>
    setImages((prev) => prev.filter((_, x) => x !== i));

  /* ===========================
     Reference Image
     =========================== */
  const setReferenceImage = (file, items = []) => {
    const obj = {
      file,
      url: URL.createObjectURL(file),
      items,
    };
    setReference(obj);
    setReferenceItems(items);
    setRemovedItems([]);
    setReplaceItems({});
  };

  const handleReferenceFileUpload = (files) => {
    const file = files[0];
    if (!file) return;
    setReferenceImage(file, []);
  };

  const addPresetReference = async (preset) => {
    const file = await urlToFile(preset.url);
    setReferenceImage(file, preset.items);
  };

  const removeReference = () => {
    setReference(null);
    setReferenceItems([]);
    setReplaceItems({});
    setRemovedItems([]);
  };

  /* ===========================
     Replace + Delete Logic
     =========================== */
  const updateDetectedItem = (index, newVal) => {
    setReferenceItems((prev) =>
      prev.map((it, i) => (i === index ? newVal : it))
    );
  };

  const deleteDetectedItem = (index) => {
    const removed = referenceItems[index];
    setRemovedItems((prev) => [...prev, removed]);

    setReferenceItems((prev) => prev.filter((_, i) => i !== index));

    setReplaceItems((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  const addDetectedItem = () => {
    setReferenceItems((prev) => [...prev, "New Item"]);
  };

  /* ===========================
     Auto Update Prompt With Replacement Pairs
     =========================== */
  useEffect(() => {
    let mapping = Object.keys(replaceItems)
      .map((idx) => {
        const original = referenceItems[idx];
        const rep = replaceItems[idx];
        if (!rep || rep.trim() === "") return null;
        return `${original} ➝ ${rep}`;
      })
      .filter(Boolean);

    if (mapping.length > 0) {
      const addon = `Replace in image: ${mapping.join(", ")}`;
      setPrompt(
        (p) => p.split("\n\nAI-REPLACE-MAP")[0] + `\n\nAI-REPLACE-MAP\n${addon}`
      );
    } else {
      setPrompt((p) => p.split("\n\nAI-REPLACE-MAP")[0]);
    }
  }, [replaceItems, referenceItems]);

  /* ===========================
     Submit to API
     =========================== */
  const handleAiGeneration = () => {
    if (!prompt.trim()) return alert("Enter a prompt!");
    if (images.length === 0) return alert("Upload at least one main image!");

    const formData = new FormData();

    images.forEach((img) => formData.append("images", img.file));
    if (reference?.file) formData.append("reference", reference.file);

    const finalItems = referenceItems.map((orig, idx) =>
      replaceItems[idx] && replaceItems[idx].trim() !== ""
        ? replaceItems[idx]
        : orig
    );

    formData.append("prompt", prompt);
    formData.append("refItems", JSON.stringify(finalItems));
    formData.append("removedItems", JSON.stringify(removedItems));
    formData.append("category", selectedCategory);

    generateAI(formData);
  };

  const closeStudio = () => {
    dispatch(setOpenStudio(false));
    reset();
  };

  /* ===========================
     UI
     =========================== */
  return (
    <div className="max-w-3xl h-screen bg-white text-gray-900 flex flex-col shadow-2xl">
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-2xl font-semibold">AI Studio</h2>
          <p className="text-gray-500 text-sm">
            Upload images, replace items & generate results
          </p>
        </div>

        <Button variant="ghost" onClick={closeStudio}>
          Close
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* MAIN IMAGES */}
        <div>
          <label className="text-sm font-semibold">Main Images (1–4)</label>

          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
          >
            <Upload className="w-12 h-12 text-gray-400" />
            <p className="text-gray-500 text-sm mt-2">
              Click to upload or drag & drop (max 4)
            </p>

            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleMainFiles(e.target.files)}
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative rounded-lg overflow-hidden border"
                >
                  <img src={img.url} className="h-28 w-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-black text-white p-1 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* REFERENCE IMAGE */}
        <div className="space-y-4">
          <label className="text-sm font-semibold">Reference Category</label>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            {Object.keys(referencePresets).map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>

          <p className="text-sm">Preset Reference Images</p>

          <div className="grid grid-cols-2 gap-2">
            {referencePresets[selectedCategory].map((preset, i) => (
              <div
                key={i}
                onClick={() => addPresetReference(preset)}
                className="cursor-pointer rounded overflow-hidden border"
              >
                <img src={preset.url} className="h-20 w-full object-cover" />
              </div>
            ))}
          </div>

          {!reference && (
            <div
              onClick={() => refInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl h-32 flex items-center justify-center cursor-pointer hover:bg-gray-50"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <input
                ref={refInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleReferenceFileUpload(e.target.files)}
              />
            </div>
          )}

          {reference && (
            <div className="relative rounded-lg overflow-hidden border">
              <img src={reference.url} className="h-32 w-full object-cover" />
              <div className="absolute bottom-3 left-3 bg-black text-white text-xs px-3 py-1 rounded opacity-70">
                {referenceItems.length} items detected
              </div>
              <button
                onClick={removeReference}
                className="absolute top-2 right-2 bg-black text-white p-1 rounded-full"
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>

        {/* PROMPT */}
        <PromptBuilder value={prompt} onChange={(p) => setPrompt(p)} />

        {/* ITEM REPLACER */}
        {referenceItems.length > 0 && (
          <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Replace Items (Reference → Replacement)
              </h3>

              <button
                onClick={addDetectedItem}
                className="px-3 py-1 text-sm bg-white border rounded flex items-center gap-2"
              >
                <PlusCircle size={16} /> Add Item
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>Detected in Reference</div>
              <div>Replace With</div>
            </div>

            <div className="space-y-3">
              {referenceItems.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-2 gap-4 items-center bg-white p-3 rounded border"
                >
                  {/* LEFT */}
                  <div className="flex gap-3 items-center">
                    <input
                      value={item}
                      onChange={(e) => updateDetectedItem(idx, e.target.value)}
                      className="flex-1 border rounded px-3 py-2 bg-gray-50 text-sm"
                    />

                    <button
                      onClick={() => deleteDetectedItem(idx)}
                      className="p-2 bg-red-50 text-red-600 rounded"
                    >
                      <Trash size={14} />
                    </button>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-2">
                    <input
                      value={replaceItems[idx] || ""}
                      onChange={(e) =>
                        setReplaceItems((prev) => ({
                          ...prev,
                          [idx]: e.target.value,
                        }))
                      }
                      className="flex-1 border rounded px-3 py-2 text-sm"
                      placeholder={`Replace "${item}"...`}
                    />

                    {/* CROSS ICON INSTEAD OF CLEAR BUTTON */}
                    {replaceItems[idx] && (
                      <button
                        onClick={() =>
                          setReplaceItems((prev) => {
                            const copy = { ...prev };
                            delete copy[idx];
                            return copy;
                          })
                        }
                        className="p-2 bg-gray-100 rounded text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GENERATE BUTTON */}
        <div className="pt-5">
          <Button
            disabled={loading}
            onClick={handleAiGeneration}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <Sparkles className="mr-2" />
            )}
            Generate Images
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudioSidebar;
