"use client";
import React, { useState } from "react";
import { Search, Clock } from "lucide-react";
import { useUser } from "@/store/hooks/useUser";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const { user, loading } = useUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) onSearch(query);
  };

  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery);
    if (onSearch) onSearch(historyQuery);
  };

  return (
    <div className="w-full max-w-full px-3 md:px-4">
      {/* Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 shadow-md transition-all focus-within:ring-1 ring-[#0025cc]"
      >
        <Search className="text-gray-400 mr-2" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dishes, tags, or cuisines..."
          className="w-full bg-transparent text-sm focus:outline-none text-gray-800 dark:text-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="ml-2 bg-[#0025cc] hover:bg-[#1c3eff] text-white px-4 py-1.5 text-sm rounded-md transition"
        >
          Search
        </button>
      </form>

      {!loading && user?.searchHistory?.length > 0 && (
        <div className="mt-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3">
          <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <Clock size={14} /> Recent Searches
          </h4>
          <div className="flex flex-wrap gap-2">
            {user.searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => handleHistoryClick(item.query)}
                className="px-3 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {item.query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
