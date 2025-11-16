"use client";

import { motion } from "framer-motion";
import { useImage } from "@/store/hooks/useImage";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import ImageCard from "@/components/search/image-card";
import { useRouter } from "next/navigation";

const Page = () => {
  const { downloadedImages, pagination, fetchAllDownloadedImages, loading } =
    useImage();

  const router = useRouter();

  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    fetchAllDownloadedImages(page, limit);
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (pagination?.totalPages || 1) || loading) {
      return;
    }
    setPage(newPage);
  };

  // Refresh button
  const fetchPage = () => {
    fetchAllDownloadedImages(page, limit);
  };

  // Dynamic pagination buttons
  const renderPageButtons = () => {
    const totalPages = pagination?.totalPages || 1;
    const buttons = [];

    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === page ? "default" : "outline"}
          size="sm"
          className="px-3"
          disabled={loading}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 bg-gradient-to-b from-gray-50 to-white min-h-screen"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Downloads ({pagination?.totalCount || 0})
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all downloaded images.
          </p>
        </div>

        <Button
          onClick={fetchPage}
          variant="outline"
          disabled={loading}
          className="flex items-center gap-2 rounded-md border-gray-300"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      <div>
        {downloadedImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 16v1a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
            </div>

            <h2 className="mt-6 text-xl font-semibold text-gray-700">
              No Downloads Yet
            </h2>

            <p className="mt-2 text-gray-500 text-sm max-w-sm">
              Looks like you haven’t downloaded any images. Explore our
              collection and start downloading!
            </p>

            <Button
              onClick={() => router.push("/")}
              className="mt-6 px-5 py-2.5 rounded-xl bg-black text-white hover:bg-gray-900 transition"
            >
              Browse Images
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {downloadedImages.map((item) => (
              <ImageCard
                key={item._id}
                title={item.imageId?.title || "Untitled"}
                img={item.imageId?.image_url}
                imageId={item.imageId?._id}
              />
            ))}
          </div>
        )}
      </div>

      {pagination?.totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <p className="text-sm text-gray-500">
            Page {page} of {pagination.totalPages} ({pagination.totalCount}{" "}
            images)
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || loading}
              onClick={() => handlePageChange(page - 1)}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>

            {renderPageButtons()}

            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.totalPages || loading}
              onClick={() => handlePageChange(page + 1)}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Page;
