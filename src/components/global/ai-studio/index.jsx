"use client";

import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { setOpenStudio } from "@/store/slice/searchSlice";
import { useStudio } from "@/store/hooks/useStudio";
import ImageUploader from "./ImageUploader";
import PromptBuilder from "./propmt-input";
import Reference from "./Reference";

const AiStudio = () => {
  const dispatch = useDispatch();
  const { loading, data, error, generateAI, reset } = useStudio();

  const [images, setImages] = useState([]);
  const [prompt, setPrompt] = useState("");

  const [referenceData, setReferenceData] = useState({
    reference: null,
    category: "",
    presets: [],
    items: [],
    replaceItems: [],
  });

  console.log(referenceData);

  const handleAiGeneration = () => {
    if (!prompt.trim()) return alert("Enter a prompt!");
    if (images.length === 0) return alert("Upload at least one main image!");

    const formData = new FormData();

    images.forEach((img) => formData.append("images", img.file));

    if (referenceData.reference?.file) {
      formData.append("referenceImage", referenceData.reference.file);
    }

    formData.append("referenceItems", JSON.stringify(referenceData.items));
    formData.append(
      "replacementItems",
      JSON.stringify(referenceData.replaceItems)
    );
    formData.append("prompt", prompt);
    formData.append("category", referenceData.category || "default");

    generateAI(formData);
  };

  const closeStudio = () => {
    dispatch(setOpenStudio(false));
    reset();
  };

  return (
    <div className="max-w-3xl h-screen bg-white text-gray-900 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-2xl font-semibold">AI Studio</h2>
          <p className="text-gray-500 text-sm">
            Upload images & generate results
          </p>
        </div>
        <Button variant="ghost" onClick={closeStudio}>
          Close
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <ImageUploader
          images={images}
          onChange={(files) => setImages(files)}
          maxImages={4}
          label="Main Images"
        />

        <Reference value={referenceData} onChange={setReferenceData} />

        <PromptBuilder value={prompt} onChange={setPrompt} />

        <div className="pt-5">
          <Button
            disabled={loading}
            onClick={handleAiGeneration}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 flex justify-center items-center"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <Sparkles className="mr-2" />
            )}
            Generate Images
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded mt-4">
            <strong>Error:</strong>{" "}
            {typeof error === "string" ? error : JSON.stringify(error)}
          </div>
        )}

        {data && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded mt-4 space-y-4">
            {data.text && (
              <div>
                <strong>Text Result:</strong>
                <p>{data.text}</p>
              </div>
            )}

            {data.images && data.images.length > 0 && (
              <div>
                <strong>Generated Images:</strong>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {data.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Generated ${idx}`}
                      className="rounded border"
                    />
                  ))}
                </div>
              </div>
            )}

            {data.raw && (
              <pre className="text-xs text-gray-500 overflow-x-auto">
                {JSON.stringify(data.raw, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiStudio;
