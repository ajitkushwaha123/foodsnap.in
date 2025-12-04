"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/search/search-bar";
import ImageCard from "@/components/search/image-card";
import { useSearch } from "@/store/hooks/useSearch";
import EmptyState from "@/components/global/EmptyState";
import { Loader2 } from "lucide-react";

const Page = () => {
  const router = useRouter();

  const {
    results = [],
    loading,
    error,
    pagination,
    loadMore,
    fetchLatest,
  } = useSearch();

  const loaderRef = useRef(null);

  const showEmpty = !loading && !error && results.length === 0;
  const showResults = !error && results.length > 0;

  useEffect(() => {
    fetchLatest();
  }, []);

  const handleLoadMore = useCallback(() => {
    if (loading) return;
    if (!pagination?.hasNextPage) return;
    loadMore();
  }, [loading, pagination?.hasNextPage]);

  useEffect(() => {
    const node = loaderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && pagination?.hasNextPage) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loading, pagination?.hasNextPage]);

  const { openStudio } = useSearch();

  return (
    <div className="p-5">
      <SearchBar />

      {loading && results.length === 0 && (
        <div className="flex justify-center items-center w-full h-[400px]">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center w-full md:mt-10 md:h-[400px]">
          <EmptyState
            heading="Insufficient Credits"
            message="You’ve run out of credits. Upgrade your plan to continue downloading images."
            actionText="Upgrade Plan"
            onAction={() => router.push("/pricing")}
          />
        </div>
      )}

      {showEmpty && (
        <div className="flex justify-center bg-gray-50 py-5 rounded-md w-full h-[500px] items-center">
          <EmptyState
            heading="No Results Found"
            message="Try adjusting your search. No matching images were found."
          />
        </div>
      )}

      {showResults && (
        <div
          className={`mt-6 grid grid-cols-1 sm:grid-cols-2 ${
            openStudio == true ? "lg:grid-cols-2" : "lg:grid-cols-4"
          } gap-5`}
        >
          {results.map((item) => (
            <ImageCard
              key={item._id}
              title={item.title}
              img={item.image_url}
              imageId={item._id}
            />
          ))}
        </div>
      )}

      {pagination?.hasNextPage && (
        <div ref={loaderRef} className="flex justify-center py-10">
          <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default Page;
