"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { search } from "@/helpers/api/search";
import SearchBar from "@/components/global/Search";
import InsufficientCredits from "@/components/global/user/InsufficientCredits";
import Card from "@/components/global/Photo/Card";
import { useWishlist } from "@/store/hooks/useWishlist";

const Spinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const Page = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creditsError, setCreditsError] = useState(false);
  const router = useRouter();

  const { items: wishlistItems, getWishlist } = useWishlist();

  useEffect(() => {
    getWishlist();
  }, []);

  console.log("Wishlist items:", wishlistItems);
  const handleSearch = async (query) => {
    if (!query) return;
    setLoading(true);
    setCreditsError(false);
    try {
      const { results } = await search({ query });
      setData(results || []);
    } catch (err) {
      if (err?.response?.status === 402) {
        setCreditsError(true);
        return;
      }
      console.error("Search failed", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0a0a1a] text-black dark:text-white min-h-screen px-2 md:px-4 py-8 transition-colors duration-300">
      <div className="w-full">
        <div className="flex w-full justify-center items-center">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="mt-10">
          {creditsError ? (
            <InsufficientCredits />
          ) : loading ? (
            <Spinner />
          ) : data.length === 0 ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400 mt-20 text-sm">
              No images found. Try searching a food item or dish.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-2">
              {data.map((image, i) => (
                <Card
                  key={image._id || i}
                  image={image}
                  index={i}
                  isWishlisted={wishlistItems.some(
                    (item) => item?.Image?._id === image._id
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
