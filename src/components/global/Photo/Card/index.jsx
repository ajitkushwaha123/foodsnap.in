"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { useWishlist } from "@/store/hooks/useWishlist";

const Card = ({ image, index, isWishlisted }) => {
  const { addToWishlist, removeFromWishlist } = useWishlist();
  const [loading, setLoading] = useState(false);

  const toggleWishlist = async () => {
    if (!image?._id || loading) return;
    setLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(image._id);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(image._id);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Wishlist toggle failed:", error);
      toast.error("Wishlist update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = image.image_url;
      link.download = `${image.title || "image"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Image download failed.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-3 shadow-md flex flex-col gap-3 transition-all"
    >
      <img
        loading="lazy"
        src={image.image_url}
        alt={image.title || "Gallery image"}
        className="w-full h-56 object-cover rounded-md border border-zinc-200 dark:border-white/10"
      />

      <div className="absolute top-3 right-3 flex gap-2">
        <motion.button
          onClick={toggleWishlist}
          whileTap={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white/80 dark:bg-black/50 p-1.5 rounded-md flex items-center justify-center"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          disabled={loading}
        >
          {loading ? (
            <span className="w-5 h-5 inline-block animate-spin rounded-full border-2 border-t-transparent border-black dark:border-white" />
          ) : isWishlisted ? (
            <AiFillHeart className="w-5 h-5 text-red-500" />
          ) : (
            <AiOutlineHeart className="w-5 h-5 text-black dark:text-white" />
          )}
        </motion.button>

        <button
          onClick={handleDownload}
          className="bg-white/80 dark:bg-black/50 p-1.5 rounded-md hover:scale-105 transition"
          aria-label="Download image"
        >
          <Download className="w-5 h-5 text-black dark:text-white" />
        </button>
      </div>
    </motion.div>
  );
};

export default Card;
