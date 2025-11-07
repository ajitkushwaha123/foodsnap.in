"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, Sparkles, ImageIcon } from "lucide-react";
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
    if (downloading) return;
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

  return (
    <motion.div
      key={image._id || index}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer"
    >
      <div
        className="overflow-hidden border-2 rounded-md p-3 border-gray-200 dark:border-gray-800 
                   shadow-sm hover:shadow-md transition bg-white dark:bg-zinc-900"
      >
        <div className="relative border-2 rounded-md overflow-hidden group">
          {image?.image_url ? (
            <img
              src={image.image_url}
              alt={image.title || "Image"}
              loading="lazy"
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <ImageIcon className="text-gray-400 w-8 h-8" />
            </div>
          )}

          <div className="absolute top-3 right-3 flex gap-2">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleDownload}
                    aria-label={`Download ${image.title || "food"} image`}
                    className="bg-white/80 dark:bg-black/60 backdrop-blur-sm p-2 rounded-full 
                               hover:scale-110 active:scale-95 transition-transform shadow-sm"
                  >
                    {downloading ? (
                      <span className="w-5 h-5 inline-block animate-spin rounded-full border-2 border-t-transparent border-black dark:border-white" />
                    ) : (
                      <Download className="w-5 h-5 text-black dark:text-white" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>Download Image</TooltipContent>
              </Tooltip>

              <ImageOptions imageId={image._id} />
            </TooltipProvider>
          </div>
        </div>

        {image.title && (
          <p
            className="mt-2 text-sm text-gray-700 dark:text-gray-300 truncate"
            title={image.title}
          >
            {image.title}
          </p>
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
      </div>
    </motion.div>
  );
};

export default Card;
