import { getUserId } from "@/helpers/auth";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({
        message: "User not found",
        success: false,
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a short product description for keep it to point and concise: ${query}`,
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      message: "Description fetched successfully",
      success: true,
      description: result.response.text(),
    });
  } catch (err) {
    return NextResponse.json({
      message: err.message || "Error fetching description",
      success: false,
    });
  }
};
