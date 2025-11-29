import { uploadToS3 } from "@/lib/uploadToS3";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const prompt = formData.get("prompt");
    const images = formData.getAll("images");

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const imageParts = await Promise.all(
      images.map(async (img) => {
        const arrayBuffer = await img.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        return {
          inline_data: { mime_type: img.type, data: base64 },
        };
      })
    );

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, ...imageParts],
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
    console.log("Gemini JSON:", json);

    let textResult = "";
    json?.candidates?.forEach((c) => {
      c?.content?.parts?.forEach((part) => {
        if (part.text) {
          textResult += part.text + "\n";
        }
      });
    });

    const base64Images = [];

    json?.candidates?.forEach((c) => {
      c?.content?.parts?.forEach((part) => {
        if (part.inlineData?.data) {
          base64Images.push({
            mimeType: part.inlineData.mimeType || "image/jpeg",
            base64: part.inlineData.data,
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
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
