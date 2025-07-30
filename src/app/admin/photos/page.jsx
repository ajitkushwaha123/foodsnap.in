"use client";
import React, { useEffect, useState } from "react";
import { image } from "@/helpers/api/image";
import PhotoTable from "@/components/global/Table/PhotoTable";

const foodColumns = [
  { key: "image", label: "Image" },
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "tags", label: "Tags" },
  { key: "status", label: "Status" },
  { key: "scores", label: "Scores" },
  { key: "actions", label: "Actions" },
];

const Page = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPhotos = async () => {
    setLoading(true);
    setError("");
    try {
      const { images } = await image();

      console.log("Fetched images:", images);
      setPhotos(images);
    } catch (err) {
      console.error("Error fetching photos:", err);
      setError("Failed to load photos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  return (
    <div className="p-4">
      {loading ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          Loading photos...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : photos.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          No photos found.
        </div>
      ) : (
        <PhotoTable columns={foodColumns} data={photos} />
      )}
    </div>
  );
};

export default Page;
