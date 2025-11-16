"use client";

import React, { useState } from "react";
import {
  ImageIcon,
  Download,
  MessageSquareWarning,
  Loader2,
} from "lucide-react";
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
  const { handleDownloadImage, handleReportImage } = useImage();

  const [isDownloading, setIsDownloading] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

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

  const reportImage = async (e) => {
    e.stopPropagation();
    setIsReporting(true);

    try {
      await handleReportImage(imageId);
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="cursor-pointer">
        <div className="overflow-hidden border rounded-md p-3 border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all">
          <div className="relative rounded-md overflow-hidden shadow-sm">
            {img && (
              <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isReporting}
                      onClick={reportImage}
                      className="h-8 w-8 rounded-md bg-white/70 dark:bg-black/40 backdrop-blur-sm border border-white/40 dark:border-white/10"
                    >
                      {isReporting ? (
                        <Loader2
                          size={16}
                          className="animate-spin text-red-500"
                        />
                      ) : (
                        <MessageSquareWarning
                          size={16}
                          className="text-red-600"
                        />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Report this image</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDownloading}
                      onClick={startDownload}
                      className="h-8 w-8 rounded-md bg-white/70 dark:bg-black/40 backdrop-blur-sm border border-white/40 dark:border-white/10"
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
                  <TooltipContent side="left">
                    Download watermark-free image
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {img && (
              <div className="absolute bottom-3 rounded-sm text-white px-2 text-sm bg-red-500/70 dark:bg-black/40 backdrop-blur-sm  right-3 z-50 flex items-center gap-2">
                Zomato Approved
              </div>
            )}

            {img ? (
              <div className="relative w-full h-48">
                <img
                  src={img}
                  alt={title}
                  className="w-full h-full object-cover"
                />

                {/* {isFreeUser && (
                  <img
                    src="/assets/logo-transparent.png"
                    className="absolute bottom-0 right-0 w-32 opacity-15 pointer-events-none select-none"
                  />
                )} */}
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <ImageIcon className="text-gray-400 w-8 h-8" />
              </div>
            )}
          </div>

          {title && (
            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {title}
            </p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ImageCard;
