import { uploadToS3 } from "@/lib/uploadToS3";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Convert uploaded files → Gemini inlineData format
async function convertToInlineData(files) {
  if (!files || files.length === 0) return [];

  const results = await Promise.all(
    files.map(async (file) => {
      if (!file?.arrayBuffer) return null;

      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      return { inlineData: { mimeType: file.type, data: base64 } };
    })
  );

  return results.filter(Boolean);
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    // Base prompt
    const prompt = formData.get("prompt")?.toString().trim();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // File inputs
    const referenceImages = formData.getAll("referenceImage").filter(Boolean);
    const images = formData.getAll("images").filter(Boolean);

    // Parse reference + replacement items
    let referenceItems = [];
    let replacementItems = [];

    try {
      referenceItems = JSON.parse(formData.get("referenceItems") || "[]");
      replacementItems = JSON.parse(formData.get("replacementItems") || "[]");
    } catch (e) {
      referenceItems = [];
      replacementItems = [];
    }

    // ------------------------------
    // Build model-understandable food modification instructions
    // ------------------------------

    function buildModificationText() {
      if (referenceItems.length === 0) return "";

      let lines = [];

      const category = formData.get("category") || "general";
      lines.push(`Base Category: ${category}`);
      lines.push(`\nItems to Use:`);

      referenceItems.forEach((item, i) => {
        const rep = replacementItems[i];

        if (rep && rep.trim() !== "") {
          lines.push(`- ${rep} (replaced: ${item} → ${rep})`);
        } else {
          lines.push(`- ${item}`);
        }
      });

      lines.push(
        `\nUse the modified list above to generate the final food composition.`
      );

      return lines.join("\n");
    }

    const modificationPrompt = buildModificationText();

    const finalPrompt = `${prompt}\n\n${modificationPrompt}`;

    // Convert images → inline data
    const refParts = await convertToInlineData(referenceImages);
    const imageParts = await convertToInlineData(images);

    // Gemini request body
    const body = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                referenceImages.length > 0
                  ? `Use the reference images to match styling.\n\n${finalPrompt}`
                  : finalPrompt,
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

    console.log("cghj", body.contents[0].parts[0].text);

    // Send to Gemini
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const json = await resp.json();
    console.log("GEMINI RESPONSE:", json);

    if (!resp.ok || json.error) {
      return NextResponse.json(
        { error: json.error?.message || "Gemini API error" },
        { status: resp.status || 500 }
      );
    }

    // Extract text + images
    let textResult = "";
    const base64Images = [];

    json?.candidates?.forEach((candidate) => {
      candidate?.content?.parts?.forEach((part) => {
        if (part.text) textResult += part.text + "\n";

        if (part.inlineData?.data) {
          base64Images.push({
            mimeType: part.inlineData.mimeType || "image/jpeg",
            base64: part.inlineData.data,
          });
        }
      });
    });

    // Upload images to S3
    const uploaded = [];
    for (const img of base64Images) {
      const buffer = Buffer.from(img.base64, "base64");
      const url = await uploadToS3(buffer, "ai-studio");
      uploaded.push(url);
    }

    return NextResponse.json({
      success: true,
      text: textResult.trim(),
      images: uploaded,
      raw: json,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
