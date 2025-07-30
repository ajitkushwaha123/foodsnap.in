import { Heart, Download, Star } from "lucide-react";

export default function Card({ image }) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = image.image_url;
    link.download = `${image.title}.jpg`;
    link.click();
  };

  return (
    <div className="relative group rounded-md overflow-hidden border border-transparent bg-gradient-to-br from-zinc-100 to-white dark:from-zinc-800 dark:to-zinc-900 shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.2)] transition-all duration-300">
      <div className="relative overflow-hidden">
        <img
          src={image.image_url}
          alt={image.title}
          className="w-full h-60 object-cover transition-transform duration-300 group"
        />

        {image.premium && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm">
            <Star size={14} />
            Premium
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="bg-white dark:bg-zinc-800 p-2 rounded-full shadow-xl hover:shadow-2xl transition-all"
            title="Add to Wishlist"
          >
            <Heart size={16} className="text-red-500" />
          </button>
          <button
            onClick={handleDownload}
            className="bg-white dark:bg-zinc-800 p-2 rounded-full shadow-xl hover:shadow-2xl transition-all"
            title="Download"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="p-2 px-4 bg-white/50 dark:bg-[#0a0a1a] transition-colors">
        <h3 className="text-lg font-bold text-zinc-800 dark:text-white truncate tracking-wide">
          {image.title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 capitalize">
          {image.cuisine || image.tags?.[0] || "Uncategorized"}
        </p>
      </div>

      <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-pink-400 group-hover:ring-offset-2 transition-all duration-300 pointer-events-none" />
    </div>
  );
}
