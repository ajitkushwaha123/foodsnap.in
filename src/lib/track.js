import axios from "axios";

export async function track(input) {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_ADMIN_BASE_URL}/api/events/ingest`,
      {
        ...input,
        tenantId: "APP",
        occurredAt: input.occurredAt
          ? new Date(input.occurredAt).toISOString()
          : undefined,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return res.data;
  } catch (err) {
    console.error("track failed", err.response?.data || err.message);
    return {};
  }
}
