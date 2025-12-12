import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

async function urlToFile(url, filename = "reference.jpg") {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}
