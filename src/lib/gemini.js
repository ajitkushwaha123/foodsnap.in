import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const extractValidJsonObjects = (incompleteJson) => {
  try {
    const cleaned = incompleteJson.replace(/```(?:json)?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error("No JSON object found");
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("JSON extraction failed:", err.message);
    return null;
  }
};

export const analyzeImageWithGemini = async ({
  image_url,
  title = "",
  category = "",
  sub_category = "",
  food_type = "",
  description = "",
  resId = null,
}) => {
  try {
    const imageRes = await axios.get(image_url, {
      responseType: "arraybuffer",
    });
    const base64Image = Buffer.from(imageRes.data).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const contextText = `
Given the following details about the dish:
- Title: ${title}
- Category: ${category}
- Sub-Category: ${sub_category}
- Food Type: ${food_type}
- Description: ${description}

And the image provided, generate a refined JSON object with:
{
  "title": "Name of the dish (use provided if good)",
  "auto_tags": ["auto-generated tag1", "tag2", ...],
  "cuisine": "Cuisine category",
  "quality_score": 1-10,
  "description": "Short description of the dish",
  "category": "Category of the dish",
  "sub_category": "Sub-category of the dish",
  "food_type": "Type of food (veg, non_veg, egg)"
}

Only return a valid JSON object with no extra text, markdown, or explanation.
    `.trim();

    const result = await model.generateContent([
      { text: contextText },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ]);

    const rawText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Gemini raw response:", rawText);

    const extracted = extractValidJsonObjects(rawText);
    if (!extracted) throw new Error("Invalid Gemini output");

    const finalObject = {
      title: extracted.title || title || "Untitled",
      auto_tags: Array.isArray(extracted.auto_tags) ? extracted.auto_tags : [],
      cuisine: extracted.cuisine || "Unknown",
      quality_score: extracted.quality_score || 10,
      description: extracted.description || description,
      category: extracted.category || category,
      sub_category: extracted.sub_category || sub_category,
      food_type: ["veg", "non_veg", "egg"].includes(
        extracted.food_type?.toLowerCase()
      )
        ? extracted.food_type.toLowerCase()
        : food_type || "veg",
      image_url,
      approved: false,
      system_approved: true,
      premium: true,
      popularity_score: 0,
      likes: 0,
      source: "zomato",
      resId: resId || null,
    };

    console.log("Final image object:", finalObject);
    return finalObject;
  } catch (error) {
    console.error("Gemini analysis failed:", error.message);
    return null;
  }
};
