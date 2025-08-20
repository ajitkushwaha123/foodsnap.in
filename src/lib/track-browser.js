import axios from "axios";

export async function trackBrowser(input) {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_ADMIN_BASE_URL}/api/events/ingest`,
      {
        ...input,
        source: "frontend",
        tenantId: "APP",
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return res.data;
  } catch (e) {
    return null;
  }
}
