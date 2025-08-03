"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/store/hooks/useWishlist";
import Card from "@/components/global/Photo/Card";

const Spinner = () => (
  <div className="flex justify-center items-center py-20">
    <div
      className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      role="status"
      aria-label="Loading"
    />
  </div>
);

const WishlistPage = () => {
  const router = useRouter();
  const { items, fetchLoading, fetchError, getWishlist } = useWishlist();

  useEffect(() => {
    getWishlist();
  }, []);

  return (
    <div className="bg-white dark:bg-[#0a0a1a] text-black dark:text-white min-h-screen px-4 py-8 transition-colors duration-300">
      <div className="w-full">
        <div className="mt-10">
          {fetchLoading ? (
            <Spinner />
          ) : fetchError ? (
            <p className="text-center text-red-500 mt-20 text-sm">
              Failed to load wishlist. Please try again later.
            </p>
          ) : items?.length === 0 ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400 mt-20 text-sm">
              Your wishlist is empty.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-2">
              {items.map((item, i) => (
                <Card
                  key={item._id || i}
                  image={item.Image}
                  index={i}
                  isWishlisted={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
