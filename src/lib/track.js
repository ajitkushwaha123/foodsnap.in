import axios from "axios";

export async function track(input) {
  const messagePayload = {
    key: input.userId || "anonymous",
    value: JSON.stringify({
      ...input,
      tenantId: "APP",
      occurredAt: input.occurredAt
        ? new Date(input.occurredAt).toISOString()
        : new Date().toISOString(),
    }),
  };

  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_KAFKA_SERVER_URL}/api/events/foodsnap`,
      {
        event: messagePayload,
      }
    );

    return { success: true };
  } catch (err) {
    console.error("❌ Track failed:", err.message);
    return { success: false, error: err.message };
  }
}
