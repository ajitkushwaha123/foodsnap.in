"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, PackageSearch } from "lucide-react";

import Card from "@/components/global/card";
import InsufficientCredits from "@/components/global/user/insufficient-credit";
import SearchBar from "@/components/global/search-bar";
import { latest, search } from "@/helpers";
import { Card as UiCard, CardContent } from "@/components/ui/card";

const Page = () => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [creditsError, setCreditsError] = useState(false);

  const observerRef = useRef(null);
  const observerInstance = useRef(null);
  const fetchingRef = useRef(false);

  const fetchData = useCallback(
    async ({ q, page }) => {
      if (creditsError || fetchingRef.current) return;
      fetchingRef.current = true;
      setLoading(true);

      try {
        const res = q
          ? await search({ query: q, page, limit: 12 })
          : await latest({ page, limit: 12 });

        const newResults = res.results || [];

        setData((prev) => (page === 1 ? newResults : [...prev, ...newResults]));

        // Slight delay for smoother transition
        await new Promise((r) => setTimeout(r, 200));

        setHasNextPage(res.hasNextPage ?? newResults.length > 0);
      } catch (err) {
        if (err?.response?.status === 402) {
          setCreditsError(true);
          setHasNextPage(false);
          observerInstance.current?.disconnect();
        } else {
          console.error("Fetch failed", err);
          if (page === 1) setData([]);
        }
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    [creditsError]
  );

  const handleSearch = async (q) => {
    setQuery(q);
    setPage(1);
    setCreditsError(false);
    setHasNextPage(true);
    setData([]);
    await fetchData({ q, page: 1 });
  };

  // Initial fetch
  useEffect(() => {
    fetchData({ q: "", page: 1 });
  }, []);

  // Infinite Scroll
  useEffect(() => {
    if (creditsError) return;

    if (observerInstance.current) observerInstance.current.disconnect();

    observerInstance.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          hasNextPage &&
          !creditsError
        ) {
          setPage((prev) => prev + 1);
        }
      },
      {
        rootMargin: "400px", // preload before it becomes visible
        threshold: 0,
      }
    );

    const current = observerRef.current;
    if (current) observerInstance.current.observe(current);

    return () => {
      if (current) observerInstance.current?.unobserve(current);
    };
  }, [loading, hasNextPage, creditsError]);

  // Fetch on new page
  useEffect(() => {
    if (page > 1 && !creditsError) {
      fetchData({ q: query, page });
    }
  }, [page]);

  const showEmpty = !loading && !creditsError && data.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a1a] text-black dark:text-white px-3 sm:px-4 py-6 sm:py-8 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto w-full"
      >
        <div className="flex justify-center items-center mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        <UiCard className="w-full bg-white dark:bg-[#0e0e1e] border-none shadow-none rounded-md">
          <CardContent className="p-3 my-0 sm:p-5">
            {creditsError ? (
              <InsufficientCredits />
            ) : (
              <>
                <AnimatePresence>
                  {loading && page === 1 && (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4"
                    >
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                      <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                        Fetching your latest images...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {showEmpty && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 px-4"
                  >
                    <PackageSearch className="w-14 h-14 text-gray-400" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">
                      No images found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs sm:max-w-sm">
                      Try searching for a food item or dish to get started.
                    </p>
                  </motion.div>
                )}

                <motion.div
                  layout
                  className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {data.map((image, i) => (
                    <motion.div
                      key={image._id || i}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, delay: i * 0.02 }}
                    >
                      <Card image={image} index={i} />
                    </motion.div>
                  ))}
                </motion.div>

                <AnimatePresence>
                  {loading && page > 1 && (
                    <motion.div
                      key="loader-more"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-center items-center py-10"
                    >
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={observerRef} className="h-10" />
              </>
            )}
          </CardContent>
        </UiCard>
      </motion.div>
    </div>
  );
};

export default Page;
