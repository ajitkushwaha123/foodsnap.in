"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import toast from "react-hot-toast";

const Card = ({ image, index }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${image.title || "image"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl); // Clean up

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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-3 shadow-sm hover:shadow-lg transition-all flex flex-col gap-3"
    >
      <div className="relative">
        <img
          loading="lazy"
          src={image.image_url}
          alt={image.title || "Image"}
          className="w-full h-56 sm:h-64 object-cover rounded-lg border border-zinc-200 dark:border-white/10"
        />
        <button
          onClick={handleDownload}
          aria-label="Download image"
          className="absolute top-3 right-3 bg-white/80 dark:bg-black/60 backdrop-blur-sm p-2 rounded-full hover:scale-105 transition-transform"
        >
          {downloading ? (
            <span className="w-5 h-5 inline-block animate-spin rounded-full border-2 border-t-transparent border-black dark:border-white" />
          ) : (
            <Download className="w-5 h-5 text-black dark:text-white" />
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default Card;
