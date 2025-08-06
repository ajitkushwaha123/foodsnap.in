"use client";

import React, { useEffect, useRef, useState } from "react";
import { search } from "@/helpers/api/search";
import SearchBar from "@/components/global/Search";
import InsufficientCredits from "@/components/global/user/InsufficientCredits";
import Card from "@/components/global/Photo/Card";

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const Page = () => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creditsError, setCreditsError] = useState(false);

  const observerRef = useRef(null);

  const fetchResults = async ({ query, page }) => {
    setLoading(true);
    try {
      const res = await search({ query, page });
      if (page === 1) {
        setData(res.results || []);
      } else {
        setData((prev) => [...prev, ...(res.results || [])]);
      }
      setHasNextPage(res.hasNextPage);
    } catch (err) {
      if (err?.response?.status === 402) {
        setCreditsError(true);
        return;
      }
      console.error("Search failed", err);
      if (page === 1) setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (q) => {
    if (!q) return;
    setQuery(q);
    setPage(1);
    setCreditsError(false);
    await fetchResults({ query: q, page: 1 });
  };

  // Load more when intersection observed
  useEffect(() => {
    if (!hasNextPage || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
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
  }, [hasNextPage, loading]);

  // Fetch new page when page state changes
  useEffect(() => {
    if (page !== 1) {
      fetchResults({ query, page });
    }
  }, [page]);

  return (
    <div className="bg-white dark:bg-[#0a0a1a] text-black dark:text-white px-2 md:px-4 py-8 transition-colors duration-300">
      <div className="w-full">
        <div className="flex w-full justify-center items-center">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="mt-10">
          {creditsError ? (
            <InsufficientCredits />
          ) : loading && page === 1 ? (
            <Spinner />
          ) : data.length === 0 && query ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400 mt-20 text-sm">
              No images found. Try searching a food item or dish.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-2">
                {data.map((image, i) => (
                  <Card key={image._id || i} image={image} index={i} />
                ))}
              </div>

              {loading && page > 1 && <Spinner />}

              {hasNextPage && <div ref={observerRef} className="h-10" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
