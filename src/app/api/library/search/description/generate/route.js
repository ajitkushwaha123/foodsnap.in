import { getUserId } from "@/helpers/auth";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { track } from "@/lib/track";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to simplify tracking calls for description generation
const trackDescriptionEvent = async ({
  typeKey,
  status,
  severity,
  userId,
  metadata,
}) => {
  await track({
    typeKey,
    kind: "system",
    status,
    severity,
    userId,
    metadata: {
      ...metadata,
    },
    context: { url: "/api/library/description/generate" }, // Corrected URL
  });
};

export const GET = async (req) => {
  let userId = null;
  let query = null;

  try {
    const { searchParams } = new URL(req.url);
    query = searchParams.get("query")?.trim() || null;

    const authResult = await getUserId(req);
    userId = authResult?.userId;

    // Track the initial attempt to generate a description
    await trackDescriptionEvent({
      typeKey: "DESCRIPTION_GENERATE_ATTEMPT",
      status: "info",
      severity: "low",
      userId,
      metadata: { query },
    });

    if (!userId) {
      await trackDescriptionEvent({
        typeKey: "UNAUTHORIZED_ACCESS",
        status: "failure",
        severity: "high",
        userId: null,
        metadata: { query },
      });
      return NextResponse.json(
        {
          message: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    if (!query) {
      await trackDescriptionEvent({
        typeKey: "DESCRIPTION_GENERATE_FAILED",
        status: "failure",
        severity: "low",
        userId,
        metadata: { reason: "NO_QUERY" },
      });
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
              text: `Generate a short product description for keep it to point and concise: ${query}`,
            },
          ],
        },
      ],
    });

    const description = result.response.text();

    await trackDescriptionEvent({
      typeKey: "PRODUCT_DESCRIPTION_SUCCESS",
      status: "success",
      severity: "low",
      userId,
      metadata: { query, description },
    });

    return NextResponse.json({
      message: "Description fetched successfully",
      success: true,
      description,
    });
  } catch (err) {
    console.error("Description Generation Error:", err);

    await trackDescriptionEvent({
      typeKey: "API_ERROR",
      status: "failure",
      severity: "critical",
      userId,
      metadata: { error: err.message, query },
    });

    return NextResponse.json(
      {
        message: err.message || "Error generating description",
        success: false,
      },
      { status: 500 }
    );
  }
};
