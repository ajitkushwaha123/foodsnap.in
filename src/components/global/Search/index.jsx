"use client";
import React, { useState } from "react";
import { Search } from "lucide-react";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-full px-3 md:px-4">
      <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 shadow-md transition-all focus-within:ring-1 ring-[#0025cc]">
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
          className="ml-2 bg-[#0025cc] hover:bg-[#1c3eff]s text-white px-4 py-1.5 text-sm rounded-md  transition"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
