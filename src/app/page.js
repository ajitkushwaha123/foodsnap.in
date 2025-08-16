"use client";

import React, { useEffect, useRef, useState } from "react";
import Card from "@/components/global/card";
import InsufficientCredits from "@/components/global/user/insufficient-credit";
import SearchBar from "@/components/global/search-bar";
import { latest, search } from "@/helpers";

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

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
      const res = q ? await search({ query: q, page }) : await latest({ page });

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
              <div ref={observerRef} className="h-10" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
