export async function urlToFile(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  const ext = url.split(".").pop()?.split("?")[0] || "jpg";

  return new File([blob], `preset_${Date.now()}.${ext}`, { type: blob.type });
}
