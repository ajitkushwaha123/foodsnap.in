"use client";

import React from "react";
import { search } from "@/helpers/api/search";
import Card from "@/components/global/Photo/Card";
import SearchBar from "@/components/global/Search";

const SkeletonCard = () => (
  <div className="animate-pulse bg-[#0a0a1a] border border-zinc-800 rounded-2xl shadow-inner overflow-hidden">
    <div className="h-60 w-full bg-[#090916]" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-zinc-700 rounded w-3/4" />
      <div className="h-3 bg-zinc-600 rounded w-1/2" />
    </div>
  </div>
);

const Page = () => {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async (query) => {
    if (!query) {
      console.error("Search query is required");
      return;
    }

    setLoading(true);
    try {
      const { results } = await search({ query });
      setData(results || []);
    } catch (err) {
      console.error("Search failed", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a1a] text-white px-4 py-8 min-h-screen transition-colors duration-300">
      <div className="mx-auto">
        <div className="max-w-6xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6 px-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : data.length === 0 ? (
            <p className="text-center text-zinc-400 mt-20 text-sm">
              No images found. Try a different keyword.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6 px-4">
              {data.map((image) => (
                <Card key={image._id} image={image} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
