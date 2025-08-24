import { getUserId } from "@/helpers/auth";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const GET = async (req) => {
  let userId = null;
  let query = null;

  try {
    const { searchParams } = new URL(req.url);
    query = searchParams.get("query")?.trim() || null;

    const authResult = await getUserId(req);
    userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    if (!query) {
      return NextResponse.json(
        {
          message: "Search query is required",
          success: false,
        },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a short product description, concise and to the point: ${query}`,
            },
          ],
        },
      ],
    });

    const description = result.response.text();

    return NextResponse.json({
      message: "Description fetched successfully",
      success: true,
      description,
    });
  } catch (err) {
    console.error("Description Generation Error:", err);

    return NextResponse.json(
      {
        message: err.message || "Error generating description",
        success: false,
      },
      { status: 500 }
    );
  }
};
