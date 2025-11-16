"use client";

import React, { useState } from "react";
import { ImageIcon, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImage } from "@/store/hooks/useImage";
import { useUser } from "@/store/hooks/useUser";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ImageCard = ({ title, img, imageId }) => {
  const { handleDownloadImage } = useImage();
  const [isDownloading, setIsDownloading] = useState(false);

  const { user } = useUser();

  const isFreeUser = user?.subscription?.plan === "free";

  const startDownload = async (e) => {
    e.stopPropagation();
    setIsDownloading(true);

    try {
      await handleDownloadImage(imageId);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="cursor-pointer">
      <div className="overflow-hidden border rounded-md p-3 border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all">
        <div className="relative rounded-md overflow-hidden shadow-sm">
          {/* 🔥 Tooltip Wrapped Download Button */}
          {img && (
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isDownloading}
                    onClick={startDownload}
                    className="absolute top-3 z-50 right-3 h-8 w-8 rounded-md 
                      bg-white/70 dark:bg-black/40 backdrop-blur-sm 
                      border border-white/40 dark:border-white/10"
                  >
                    {isDownloading ? (
                      <Loader2
                        size={16}
                        className="animate-spin text-gray-700 dark:text-gray-200"
                      />
                    ) : (
                      <Download
                        size={16}
                        className="text-gray-700 dark:text-gray-200"
                      />
                    )}
                  </Button>
                </TooltipTrigger>

                <TooltipContent side="left" className="text-xs font-medium">
                  {isFreeUser
                    ? "Upgrade to download without watermark"
                    : "Download watermark-free image"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Image + Watermark */}
          {img ? (
            <div className="relative w-full h-48">
              <img
                src={img}
                alt={title}
                className="w-full h-full object-cover"
              />

              {/* 🍃 Watermark (Free Users Only) */}
              {isFreeUser && (
                <img
                  src="/assets/logo-transparent.png"
                  className="absolute inset-0 w-full h-full object-contain opacity-12 pointer-events-none"
                />
              )}
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <ImageIcon className="text-gray-400 w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title */}
        {title && (
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
            {title}
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageCard;
