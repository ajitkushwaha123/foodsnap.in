"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { setOpenStudio } from "@/store/slice/searchSlice";
import { useStudio } from "@/store/hooks/useStudio";
import PromptBuilder from "../propmt-input";

const StudioSidebar = () => {
  const dispatch = useDispatch();
  const { loading, data, error, generateAI, reset } = useStudio();

  const [images, setImages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [dragCounter, setDragCounter] = useState(0);

  const dropRef = useRef(null);
  const resultRef = useRef(null);
  const inputRef = useRef(null);

  const isDraggingOver = dragCounter > 0;

  const closeStudio = () => {
    dispatch(setOpenStudio(false));
    reset();
  };

  const handleFiles = (files) => {
    const allowed = Array.from(files).slice(0, 4 - images.length);
    const mapped = allowed.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    if (mapped.length > 0) {
      setImages((prev) => [...prev, ...mapped].slice(0, 4));
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(0);

    if (e.dataTransfer.files?.length > 0) {
      handleFiles(e.dataTransfer.files);
      return;
    }

    const internal = e.dataTransfer.getData("text/internal-image");
    if (internal) {
      try {
        const res = await fetch(internal);
        const blob = await res.blob();
        const file = new File([blob], `internal-image-${Date.now()}.png`, {
          type: blob.type || "image/png",
        });
        handleFiles([file]);
      } catch (err) {}
    }
  };

  const handleBrowse = (e) => {
    handleFiles(e.target.files);
    e.target.value = null;
  };

  const removeImage = (index) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const handleAiGeneration = () => {
    if (loading) return;
    if (!prompt.trim()) return alert("Enter a prompt!");
    if (images.length === 0) return alert("Upload at least one image!");

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img.file));
    formData.append("prompt", prompt.trim());
    generateAI(formData);
  };

  useEffect(() => {
    if (data && resultRef.current) {
      setTimeout(() => {
        resultRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  }, [data]);

  useEffect(() => {
    const onDragStart = (e) => {
      const img = e.target.closest("img[data-allow-drag='true']");
      const dt = e.dataTransfer;

      if (img) {
        dt.clearData();
        dt.setData("text/internal-image", img.src);
        dt.effectAllowed = "copy";
        return;
      }
    };

    document.addEventListener("dragstart", onDragStart);
    return () => document.removeEventListener("dragstart", onDragStart);
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev - 1);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div className="w-96 h-screen bg-white border-l text-gray-900 flex flex-col shadow-xl">
      <div className="p-5 border-b">
        <h2 className="text-xl font-semibold">AI Studio</h2>
        <p className="text-gray-500 text-sm mt-1">
          Upload images & generate results.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div
          ref={dropRef}
          data-allow-drop="true"
          onClick={() => {
            inputRef.current?.click();
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl h-36 flex flex-col items-center justify-center transition cursor-pointer
            ${
              isDraggingOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:bg-gray-50"
            }`}
        >
          <Upload
            className={`w-10 h-10 ${
              isDraggingOver ? "text-blue-500" : "text-gray-400"
            }`}
          />
          <p className="text-gray-600 mt-2 text-sm">Drag & drop images here</p>
          <p className="text-xs text-gray-400 mt-1">(max 4 images)</p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleBrowse}
          />
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative group rounded-lg overflow-hidden border shadow-sm bg-gray-100"
              >
                <img
                  src={img.url}
                  className="w-full h-32 object-cover"
                  data-allow-drag="true"
                  draggable="true"
                />
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

        <PromptBuilder value={prompt} onChange={(p) => setPrompt(p)} />

        {loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="animate-spin w-8 h-8 text-green-600" />
            <p className="text-gray-600 mt-3">Generating with AI...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {data && (
          <div ref={resultRef} className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">AI Results</h3>

            {data?.images?.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {data.images.map((imgUrl, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={imgUrl}
                      className="w-full rounded-lg shadow-md object-cover"
                    />
                    <button
                      onClick={async () => {
                        const res = await fetch(imgUrl);
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `ai-result-${i + 1}.png`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="absolute bottom-3 right-3 bg-black text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-md"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}

            {data?.text && (
              <div className="bg-gray-100 p-4 rounded-lg shadow-sm whitespace-pre-wrap text-sm text-gray-700">
                {data.text}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-white flex gap-3">
        <Button
          variant="outline"
          className="w-1/2 py-5 text-md font-medium"
          onClick={closeStudio}
        >
          Cancel
        </Button>

        <Button
          className="w-1/2 py-5 text-md font-semibold bg-gradient-to-r from-[#4ade80] to-[#22c55e] hover:from-[#22c55e] hover:to-[#16a34a] text-white flex items-center justify-center gap-2"
          onClick={handleAiGeneration}
          disabled={loading || images.length === 0 || !prompt.trim()}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
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
