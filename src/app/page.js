"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, PackageSearch, ImageIcon } from "lucide-react";

import Card from "@/components/global/card";
import InsufficientCredits from "@/components/global/user/insufficient-credit";
import SearchBar from "@/components/global/search-bar";
import { latest, search } from "@/helpers";
import { Button } from "@/components/ui/button";
import { Card as UiCard, CardContent } from "@/components/ui/card";

const Page = () => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [creditsError, setCreditsError] = useState(false);

  const observerRef = useRef(null);

  const fetchData = async ({ q, page }) => {
    setLoading(true);
    try {
      const res = q
        ? await search({ query: q, page, limit: 12 })
        : await latest({ page, limit: 12 });

      if (page === 1) {
        setData(res.results || []);
      } else {
        setData((prev) => [...prev, ...(res.results || [])]);
      }

      setHasNextPage(res.hasNextPage ?? res.results?.length > 0);
    } catch (err) {
      if (err?.response?.status === 402) {
        setCreditsError(true);
        return;
      }
      console.error("Fetch failed", err);
      if (page === 1) setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (q) => {
    setQuery(q);
    setPage(1);
    setCreditsError(false);
    await fetchData({ q, page: 1 });
  };

  useEffect(() => {
    fetchData({ q: "", page: 1 });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasNextPage) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    const current = observerRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [loading, hasNextPage]);

  useEffect(() => {
    if (page > 1) {
      fetchData({ q: query, page });
    }
  }, [page]);

  const showEmpty = !loading && !creditsError && data.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a1a] text-black dark:text-white px-2 md:px-4 py-8 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <div className="flex justify-center items-center">
          <SearchBar onSearch={handleSearch} />
        </div>

        <UiCard className="w-full bg-white border-none shadow-none mt-5">
          <CardContent>
            {creditsError ? (
              <InsufficientCredits />
            ) : loading && page === 1 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                <p className="text-gray-600 text-sm font-medium">
                  Fetching your latest images...
                </p>
              </div>
            ) : showEmpty ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                <PackageSearch className="w-16 h-16 text-gray-300" />
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                  No images found
                </h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Try searching for a food item or dish to get started.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {data.map((image, i) => (
                  <Card key={image._id || i} image={image} index={i} />
                ))}
              </div>
            )}

            {loading && page > 1 && (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            )}

            <div ref={observerRef} className="h-10" />
          </CardContent>
        </UiCard>
      </motion.div>
    </div>
  );
};

export default Page;
