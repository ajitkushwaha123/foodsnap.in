import { uploadToS3 } from "@/lib/uploadToS3";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Convert File objects to base64 inline data
async function convertToInlineData(files) {
  if (!files || files.length === 0) return [];

  const results = await Promise.all(
    files.map(async (file) => {
      if (!file || typeof file.arrayBuffer !== "function") return null;

      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      return {
        inline_data: { mime_type: file.type, data: base64 },
      };
    })
  );

  return results.filter(Boolean);
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    const prompt = formData.get("prompt")?.toString().trim();
    const referenceImages = formData.getAll("referenceImage").filter(Boolean);
    const images = formData.getAll("images").filter(Boolean);

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const refParts = await convertToInlineData(referenceImages);
    const imageParts = await convertToInlineData(images);

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                referenceImages.length > 0
                  ? `Use the reference images to match style, colors, layout, and composition.\n\n${prompt}`
                  : prompt,
            },
            ...refParts,
            ...imageParts,
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
        imageConfig: { aspectRatio: "4:3", image_size: "1K" },
      },
    };

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const MODEL_ID = "gemini-3-pro-image-preview";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const json = await response.json();

    // Check if Gemini returned an error
    if (!response.ok || json.error) {
      const errMsg = json.error?.message || "Gemini API returned an error";
      return NextResponse.json(
        { error: errMsg },
        { status: response.status || 500 }
      );
    }

    let textResult = "";
    const base64Images = [];

    json?.candidates?.forEach((candidate) => {
      candidate?.content?.parts?.forEach((part) => {
        if (part.text) textResult += part.text + "\n";

        if (part.inline_data?.data) {
          base64Images.push({
            mimeType: part.inline_data.mime_type || "image/jpeg",
            base64: part.inline_data.data,
          });
        }
      });
    });

    if (base64Images.length === 0 && !textResult.trim()) {
      throw new Error("No content found in Gemini response");
    }

    const uploadedImages = [];

    for (const img of base64Images) {
      const buffer = Buffer.from(img.base64, "base64");
      const url = await uploadToS3(buffer, "ai-studio");
      uploadedImages.push(url);
    }

    return NextResponse.json({
      success: true,
      text: textResult.trim(),
      images: uploadedImages,
      raw: json,
    });
  } catch (err) {
    // Return actual error from Gemini if available
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
