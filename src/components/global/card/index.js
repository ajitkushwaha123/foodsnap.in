"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ImageOptions from "../general/image-options";

const Card = ({ image, index }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const response = await axios.get(
        `/api/image/download?imageId=${image._id}`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const blobUrl = URL.createObjectURL(response.data);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${image.title || "foodsnap-food-image"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);

      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Image download failed.");
    } finally {
      setDownloading(false);
    }
  };

  const handleReport = () => {
    toast.success("Reported successfully. Our team will review this image.");
    // Optionally send API request here to flag the image
    // axios.post("/api/report", { imageId: image._id });
  };

  return (
    <motion.figure
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-3 shadow-sm hover:shadow-lg transition-all flex flex-col gap-3"
    >
      <div className="relative">
        <img
          loading="lazy"
          width="400"
          height="300"
          src={image.image_url}
          alt={
            image.title
              ? `${image.title} - High Quality Zomato & Swiggy Approved Food Image by Foodsnap`
              : "Premium food image for restaurant menus - Zomato & Swiggy approved"
          }
          className="w-full h-56 sm:h-64 object-cover rounded-lg border border-zinc-200 dark:border-white/10"
        />

        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={handleDownload}
            aria-label={`Download ${image.title || "food"} image`}
            className="bg-white/80 dark:bg-black/60 backdrop-blur-sm p-2 rounded-full hover:scale-105 transition-transform"
          >
            <Sparkles className="w-5 h-5 text-black dark:text-white" />
          </button>

          <button
            onClick={handleDownload}
            aria-label={`Download ${image.title || "food"} image`}
            className="bg-white/80 dark:bg-black/60 backdrop-blur-sm p-2 rounded-full hover:scale-105 transition-transform"
          >
            {downloading ? (
              <span className="w-5 h-5 inline-block animate-spin rounded-full border-2 border-t-transparent border-black dark:border-white" />
            ) : (
              <Download className="w-5 h-5 text-black dark:text-white" />
            )}
          </button>

          <ImageOptions imageId={image._id} />
        </div>
      </div>

      {image.title && (
        <figcaption className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {image.title}
        </figcaption>
      )}

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ImageObject",
          contentUrl: image.image_url,
          name: image.title || "Foodsnap Food Image",
          description:
            image.title ||
            "High quality food image for restaurant menus - Zomato & Swiggy approved",
          creator: {
            "@type": "Organization",
            name: "Foodsnap",
            url: "https://foodsnap.in",
          },
        })}
      </script>
    </motion.figure>
  );
};

export default Card;
